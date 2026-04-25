Photography website

This website is used to showcase my passion for photography and capturing a slice of life.

Features:
- Display photos stored in a blob via AWS api call.
- Automatically load next set of photos when scrollbar is at the bottom of the page.
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
5. deploy via vercel (vercel dev)

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