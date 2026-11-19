Photography website

This website is used to showcase my passion for photography and capturing a slice of life.

Features:
- Display photos stored in a blob via AWS api call.
- Automatically load next set of photos when scrollbar is at the bottom of the page.
- Discover first-level R2 folders as albums and use the root-level `albums.json` file for album titles, categories, cover photos, and optional descriptions.
- Show all discovered albums on the homepage and filter the Travel, Events, and Portraits pages by category.
- Accept contact enquiries from the Contact page and homepage, including optional event details.
- Show an Instagram photo feed and Gallery/Contact links at the bottom of every page.

Album metadata
--------------
Upload `albums.json` to the root of the same R2 bucket that contains the album folders. Use each folder name as a key; adding photos to an existing folder does not require changing this file.

```json
{
    "jp25": {
        "title": "Japan 2025",
        "category": "travel",
        "cover": "DSC00123.jpg",
        "description": "A few words about this trip."
    },
    "vn25": { "title": "Vietnam 2025", "category": "travel", "cover": "IMG_4567.jpg" },
    "wedding-2025": { "title": "A Wedding", "category": "events" },
    "portrait-session": { "title": "Portrait Session", "category": "portraits" }
}
```

Supported categories are `travel`, `events`, and `portraits`. Set `cover` to the image's path relative to its album folder; if omitted, the first image found in that folder is used. Set `description` to optional text shown below the album cover. The homepage includes every folder with images; category pages include folders whose `category` matches the page. Albums without a metadata entry still appear on the homepage with a generated title.

TODO:
- Discovery: filter and display photos based off the object tags
- Implement portraits page based off portrait tag
- Implement events page based off event tag
- Define requirements for pricing page
- Define requirements for contact page
- Define requirements for about page

Tech Stack / requirements:
- HTML, CSS, Nodejs
    - brew install node
- Cloudflare R2
- Vercel
    - npm install -g vercel
- AWS CLI


Installation / Setup
1. git clone https://github.com/jl334uow/photographyWebsite.git
2. cd photographyWebsite
3. npm install
4. configure .env file
5. Add any updates from .env file to vercel environment variables
6. deploy via vercel (vercel dev)

Syncing photos

Listing objects:
1. Ensure AWS CLI is installed
2. ~/.aws/credentials:
    [r2]
    aws_access_key_id = YOUR_R2_ACCESS_KEY_ID
    aws_secret_access_key = YOUR_R2_SECRET_ACCESS_KEY
3. List objects in a specific bucket
    aws s3 ls s3://your-bucket-name --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com --profile r2

Downloading objects:
aws s3 sync s3://your-bucket-name ./local-folder --profile r2

Uploading objects:
aws s3 sync ./local-folder s3://your-bucket-name --profile r2

Upload new local files AND delete files from R2 that no longer exist locally:
aws s3 sync ./local-folder s3://your-bucket-name --profile r2 --delete