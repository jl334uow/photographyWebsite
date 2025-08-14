import dotenv from 'dotenv';
import {
    S3Client,
    ListBucketsCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();

export default async function handler(req, res) {
    try
    {
        // Retreive list of keys through R2 S3 API
        console.log(process.env.ACCESS_KEY_ID);
        const s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.ACCESS_KEY
            }
        });
        const listCommand = new ListObjectsV2Command({Bucket: 'photography-website'});
        const listResponse = await s3.send(listCommand);
        const signedUrls = [];
        for(const obj of listResponse.Contents) {
            const url = await getSignedUrl(s3, new GetObjectCommand({Bucket:process.env.BUCKET_ID, Key: obj.Key}, {expiresIn: 3600}));
            signedUrls.push({key: obj.Key, url});
        }
        res.status(200).json(signedUrls);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}