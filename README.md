# MarkD
MarkD is a self-hosted, single user, Kanban style planning board and Markdown Notes app.

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

Notes are stored in `./userData/Notes`, Boards are stored in `./userData/boards.json`, and the hashed password is stored in `./userData/password.txt`. These defaults can be changed in `server.js`.

After entering your password in the UI on first run, it can be reset by manually deleting the file.

## Help
### Deck
Deck is a Kanban style planning board.

Items are grouped into Stacks, and Stacks are grouped into Boards.

Boards can be accessed from the sidebar on the right of the boards page. On each board, Stacks and Items can be added.

Boards and Items can be re-ordered by dragging them around using the drag handles, while Stacks can be re-ordered from their menus.

Any part of the structure can be archived to hide it from view.

### Notes
Notes is a text viewer/editor that stores files in Markdown format. 

Files are shown on the page and are categorized by their subdirectory on the server. Nested subdirectories are not supported.

## Screenshots
### Deck - Main Screen
![Screenshot of Deck](/screenshots/Deck.png?raw=true "Deck")
### Notes - Main Screen
![Screenshot of Notes](/screenshots/Notes.png?raw=true "Notes")
### Notes - Editor
![Screenshot of Notes Editor](/screenshots/Editor.png?raw=true "Notes Editor")
### Responsive UI and dark mode
![Screenshot of Responsive UI and dark mode](/screenshots/ResponsiveDark.png?raw=true "Responsive UI and dark mode")
