import dotenv from 'dotenv';
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
dotenv.config();

const isImage = (key) => /\.(avif|gif|jpe?g|png|webp)$/i.test(key);

export default async function handler(req, res) {
    try {
        const s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.ACCESS_KEY
            }
        });

        const bucket = process.env.BUCKET_ID || 'photography-website';
        const album = typeof req.query?.album === 'string' ? req.query.album : '';
        const wantsAlbums = req.query?.albums === '1';
        const category = typeof req.query?.category === 'string'
            ? req.query.category.trim().toLowerCase()
            : '';

        if (category && !/^[a-z0-9_-]+$/.test(category)) {
            res.status(400).json({ error: 'Invalid album category' });
            return;
        }

        async function listImages(prefix = '', directOnly = false) {
            const images = [];
            let continuationToken;

            do {
                const response = await s3.send(new ListObjectsV2Command({
                    Bucket: bucket,
                    Prefix: prefix,
                    ContinuationToken: continuationToken
                }));

                for (const object of response.Contents || []) {
                    const relativeKey = object.Key.slice(prefix.length);
                    if (isImage(object.Key) && (!directOnly || !relativeKey.includes('/'))) {
                        images.push(object.Key);
                    }
                }

                continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
            } while (continuationToken);

            return images;
        }

        async function signImage(key) {
            const url = await getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: bucket, Key: key }),
                { expiresIn: 3600 }
            );
            return { key, url };
        }

        if (wantsAlbums) {
            let albumMetadata = {};

            try {
                const manifest = await s3.send(new GetObjectCommand({
                    Bucket: bucket,
                    Key: 'albums.json'
                }));
                albumMetadata = JSON.parse(await manifest.Body.transformToString());

                if (!albumMetadata || Array.isArray(albumMetadata) || typeof albumMetadata !== 'object') {
                    throw new Error('albums.json must be an object keyed by album folder name');
                }
            } catch (error) {
                if (error.name !== 'NoSuchKey' && error.$metadata?.httpStatusCode !== 404) {
                    throw error;
                }
            }

            const prefixes = new Set();
            let continuationToken;

            do {
                const response = await s3.send(new ListObjectsV2Command({
                    Bucket: bucket,
                    Delimiter: '/',
                    ContinuationToken: continuationToken
                }));

                for (const item of response.CommonPrefixes || []) {
                    if (item.Prefix) prefixes.add(item.Prefix);
                }

                continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
            } while (continuationToken);

            const albums = await Promise.all(Array.from(prefixes, async (prefix) => {
                const imageKeys = await listImages(prefix);
                if (imageKeys.length === 0) return null;

                const slug = prefix.slice(0, -1);
                const entry = albumMetadata[slug];
                const metadata = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {};
                const cover = await signImage(imageKeys[0]);
                return {
                    slug,
                    title: typeof metadata.title === 'string' && metadata.title.trim()
                        ? metadata.title.trim()
                        : slug.replace(/[-_]/g, ' ').toUpperCase(),
                    category: typeof metadata.category === 'string'
                        ? metadata.category.trim().toLowerCase()
                        : '',
                    coverUrl: cover.url
                };
            }));

            res.status(200).json(albums.filter((item) => item && (!category || item.category === category)));
            return;
        }

        if (album) {
            if (!/^[a-zA-Z0-9_-]+$/.test(album)) {
                res.status(400).json({ error: 'Invalid album name' });
                return;
            }

            const images = await listImages(`${album}/`);
            const signedImages = await Promise.all(images.map(signImage));
            res.status(200).json(signedImages);
            return;
        }

        const rootImages = await listImages('', true);
        const signedImages = await Promise.all(rootImages.map(signImage));
        res.status(200).json(signedImages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}