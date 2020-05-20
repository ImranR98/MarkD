# MarkD
MarkD is a self-hosted, single user, Notes app that uses MarkDown formatted files.

### Configuration
An RSA public/private key pair is needed for user sessions, along with a duration, in seconds, that each session lasts. These are needed as environment variables and can be defined in a .env file in the root directory.

Example of a valid .env file (Note that variables must fit in one line, so the public/private keys have '\n' in place of line breaks. This is accounted for in app.js):
```
RSA_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n...\n-----END RSA PRIVATE KEY-----
RSA_PUBLIC_KEY=-----BEGIN RSA PUBLIC KEY-----\n...\n...\n-----END RSA PUBLIC KEY-----
EXPIRES_IN=86400
```

## Deployment
Runs on port 8080 by default, run `npm start` to start.

Board and hashed password data is stored in `./userData` by default, but this can be changed in `server.js`.

After entering your password in the UI on first run, it can be reset by manually deleting the file.

## Help
Files are shown on the main page and are categorized by subdirectory.

## Screenshots
### Categories Overview
![Screenshot of Categories page](/screenshots/CategoriesOverview.png?raw=true "Categories Overview")
### Category
![Screenshot of Category page](/screenshots/Category.png?raw=true "Category")
### Responsive UI and dark mode
![Screenshot of Responsive UI and dark mode](/screenshots/ResponsiveDark.png?raw=true "Responsive UI and dark mode")