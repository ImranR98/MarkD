// Required modules
const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: __dirname + '/.env' })

// If the userDataDir is changed, it should also be changed in .gitignore to avoid committing personal data
const userDataDir = `${__dirname}/userData`
const passwordPath = `${userDataDir}/password.txt`
const notesDir = `${__dirname}/userData/Notes`
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir)
else if (!fs.statSync(userDataDir).isDirectory()) fs.mkdirSync(userDataDir)
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir)
else if (!fs.statSync(notesDir).isDirectory()) fs.mkdirSync(notesDir)

// Ensure key pair for authentication exists
if (!process.env.RSA_PRIVATE_KEY || !process.env.RSA_PUBLIC_KEY || !process.env.EXPIRES_IN) throw 'Environment variables missing.'

app.use(bodyparser.json())
app.use(express.static(__dirname + '/dist/MarkD'))

// Allow cross origin requests when on localhost (development)
app.use((req, res, next) => {
    let valid = false
    if (req.header('origin')) {
        if (req.header('origin').indexOf('http://localhost:') == 0) {
            valid = true
        }
    }
    if (valid) {
        res.header('Access-Control-Allow-Origin', req.header('origin'))
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        res.header('Access-Control-Allow-Credentials', 'true')
    }
    next()
})

String.prototype.replaceAll = function (search, replacement) {
    var target = this
    return target.split(search).join(replacement)
}

// Middleware to check for JSON Web Token in the request header
checkIfAuthenticated = expressJwt({
    secret: process.env.RSA_PUBLIC_KEY.replaceAll('\\n', '\n'),
    requestProperty: 'jwt'
})

// Returns { folder: string, notes: { fileName: string, modified: Date, created: Date }[] }[] for all notes/folders
const getList = () => {
    let contents = fs.readdirSync(notesDir)
    let data = [{ folder: '', notes: contents.filter(item => item.toLowerCase().endsWith('.md')) }]
    contents.filter(item => fs.statSync(`${notesDir}/${item}`).isDirectory()).forEach(folder => data.push({ folder: folder, notes: [] }))
    data = data.map(folderAndNotes => {
        if (folderAndNotes.folder) {
            folderAndNotes.notes = fs.readdirSync(`${notesDir}/${folderAndNotes.folder}`).filter(item => item.toLowerCase().endsWith('.md'))
        }
        return folderAndNotes
    })
    data = data.map(folderAndNotes => {
        folderAndNotes.notes = folderAndNotes.notes.map(note => {
            let stats = fs.statSync(`${notesDir}/${folderAndNotes.folder}/${note}`)
            return {
                fileName: note,
                modified: stats.mtime,
                created: stats.ctime
            }
        })
        return folderAndNotes
    })
    return data
}
const getNote = (folder, fileName) => {
    let stats = fs.statSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`)
    return {
        info: {
            fileName: fileName,
            modified: stats.mtime,
            created: stats.ctime
        },
        folder: folder ? folder : '',
        data: fs.readFileSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`).toString()
    }
}
const saveNote = (folder, fileName, noteData) => {
    fs.writeFileSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`, noteData ? noteData : '')
}
const deleteNote = (folder, fileName) => {
    fs.unlinkSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`)
}
const createFolder = (folder) => {
    fs.mkdirSync(`${notesDir}/${folder}`)
}
const deleteFolder = (folder) => {
    fs.rmdirSync(`${notesDir}/${folder}`)
}

// Read and write to password file
const getPassword = () => {
    let password = null
    if (fs.existsSync(passwordPath)) {
        try {
            password = fs.readFileSync(passwordPath).toString()
        } catch (err) {
            console.log(err)
            fs.unlinkSync(passwordPath)
        }
    }
    return password
}

const setPassword = (password) => {
    fs.writeFileSync(passwordPath, password)
}

// Authenticate against the saved password (return a valid JWT if successful)
app.post('/auth', (req, res) => {
    try {
        if (!req.body.password) res.status(400).send()
        else {
            let password = getPassword()
            if (!password) res.status(500).send()
            else {
                if (bcrypt.compareSync(req.body.password, password)) {
                    res.json({
                        jwtToken: jwt.sign({}, process.env.RSA_PRIVATE_KEY.replaceAll('\\n', '\n'), {
                            algorithm: 'RS256',
                            expiresIn: parseInt(process.env.EXPIRES_IN)
                        })
                    })
                } else {
                    res.status(401).send()
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send()
    }
})

// Create a new password (only works if one doesn't exist - meant for first time ugetPassword()se)
app.post('/createPassword', (req, res) => {
    try {
        if (!req.body.password) res.status(400).send()
        else if (getPassword()) res.status(500).send()
        else {
            setPassword(bcrypt.hashSync(req.body.password, 10))
            res.send()
        }
    } catch (err) {
        console.log(err)
        res.status(500).send()
    }
})

// Check if a password exists
app.get('/ifPassword', (req, res) => {
    try {
        res.send(!getPassword())
    } catch (err) {
        console.log(err)
        res.status(500).send()
    }
})

// Change the password (needs the current password to work)
app.post('/changePassword', /*checkIfAuthenticated,*/(req, res) => {
    try {
        if (!req.body.password) res.status(400).send()
        else {
            setPassword(bcrypt.hashSync(req.body.password, 10))
            res.send()
        }
    } catch (err) {
        console.log(err)
        res.status(500).send()
    }
})

app.get('/list', /*checkIfAuthenticated,*/(req, res) => {
    try {
        res.send(getList())
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})
app.post('/note/get', /*checkIfAuthenticated,*/(req, res) => {
    if (!req.body.fileName) res.status(400).send()
    else {
        try {
            res.send(getNote(req.body.folder, req.body.fileName))
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
})
app.post('/note/save', /*checkIfAuthenticated,*/(req, res) => {
    if (!req.body.fileName) res.status(400).send()
    else {
        try {
            res.send(saveNote(req.body.folder, req.body.fileName, req.body.data))
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
})
app.post('/note/delete', /*checkIfAuthenticated,*/(req, res) => {
    if (!req.body.fileName) res.status(400).send()
    else {
        try {
            res.send(deleteNote(req.body.folder, req.body.fileName))
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
})
app.post('/folder/create', /*checkIfAuthenticated,*/(req, res) => {
    if (!req.body.folder) res.status(400).send
    else {
        try {
            res.send(createFolder(req.body.folder))
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
})

app.post('/folder/delete', /*checkIfAuthenticated,*/(req, res) => {
    if (!req.body.folder) res.status(400).send
    else {
        try {
            res.send(deleteFolder(req.body.folder))
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
    }
})

// Any other route serves the frontend
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/deck/index.html')
});

//Set Port
let HTTP_PORT = process.env.PORT || 8080;

//Start Server
app.listen(HTTP_PORT, function () {
    console.log(`App running on port ${HTTP_PORT}.`)
});