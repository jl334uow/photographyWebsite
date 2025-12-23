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


Installation / Setup
1. git clone https://github.com/jl334uow/photographyWebsite.git
2. cd photographyWebsite
3. npm install
4. configure .env file
5. deploy via vercel (vercel dev)