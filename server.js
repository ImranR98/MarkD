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

const getFolders = () => {
    return [''].concat(fs.readdirSync(notesDir).filter(item => fs.statSync(`${notesDir}/${item}`).isDirectory()))
}
const getFolder = (folder) => {
    let target = `${notesDir}${folder ? `/${folder}` : ''}`
    if (fs.existsSync(target)) {
        if (fs.statSync(target).isDirectory()) {
            let data = {
                folder: folder,
                notes: fs.readdirSync(target).filter(fileName => fileName.toLowerCase().endsWith('.md')).map(fileName => {
                    let stats = fs.statSync(`${target}/${fileName}`)
                    return {
                        fileName: fileName,
                        modified: stats.mtime,
                        created: stats.ctime
                    }
                })
            }
            return data
        }
    }
    throw null
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
const renameNote = (folder, fileName, newName) => {
    fs.renameSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`, `${notesDir}/${folder ? folder + '/' : ''}${newName}`)
}
const moveNote = (folder, fileName, toFolder) => {
    if (folder != toFolder) {
        fs.copyFileSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`, `${notesDir}/${toFolder ? toFolder + '/' : ''}${fileName}`)
        fs.unlinkSync(`${notesDir}/${folder ? folder + '/' : ''}${fileName}`)
    }
}
const createFolder = (folder) => {
    fs.mkdirSync(`${notesDir}/${folder}`)
}
const deleteFolder = (folder) => {
    fs.rmdirSync(`${notesDir}/${folder}`)
}
const renameFolder = (folder, newFolder) => {
    if (folder && newFolder) {
        fs.renameSync(`${notesDir}/${folder}`, `${notesDir}/${newFolder}`)
    } else throw null
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
        if (!req.body.password) res.sendStatus(400).send()
        else {
            let password = getPassword()
            if (!password) res.sendStatus(500).send()
            else {
                if (bcrypt.compareSync(req.body.password, password)) {
                    res.json({
                        jwtToken: jwt.sign({}, process.env.RSA_PRIVATE_KEY.replaceAll('\\n', '\n'), {
                            algorithm: 'RS256',
                            expiresIn: parseInt(process.env.EXPIRES_IN)
                        })
                    })
                } else {
                    res.sendStatus(401).send()
                }
            }
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send()
    }
})

// Create a new password (only works if one doesn't exist - meant for first time ugetPassword()se)
app.post('/createPassword', (req, res) => {
    try {
        if (!req.body.password) res.sendStatus(400).send()
        else if (getPassword()) res.sendStatus(500).send()
        else {
            setPassword(bcrypt.hashSync(req.body.password, 10))
            res.send()
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send()
    }
})

// Check if a password exists
app.get('/ifPassword', (req, res) => {
    try {
        res.send(!getPassword())
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send()
    }
})

// Change the password (needs the current password to work)
app.post('/changePassword', checkIfAuthenticated, (req, res) => {
    try {
        if (!req.body.password) res.sendStatus(400).send()
        else {
            setPassword(bcrypt.hashSync(req.body.password, 10))
            res.send()
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send()
    }
})

app.get('/folders', checkIfAuthenticated, (req, res) => {
    try {
        res.send(getFolders())
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send(err)
    }
})
app.post('/note/get', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(getNote(req.body.folder, req.body.fileName))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/note/save', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(saveNote(req.body.folder, req.body.fileName, req.body.data))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/note/delete', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(deleteNote(req.body.folder, req.body.fileName))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/note/move', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(moveNote(req.body.folder, req.body.fileName, req.body.toFolder))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/note/rename', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(renameNote(req.body.folder, req.body.fileName, req.body.newName))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/folder/get', checkIfAuthenticated, (req, res) => {
    try {
        res.send({ folder: getFolder(req.body.folder), folders: getFolders() })
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send(err)
    }
})
app.post('/folder/create', checkIfAuthenticated, (req, res) => {
    if (!req.body.folder) res.sendStatus(400).send
    else {
        try {
            res.send(createFolder(req.body.folder))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})

app.post('/folder/delete', checkIfAuthenticated, (req, res) => {
    if (!req.body.folder) res.sendStatus(400).send
    else {
        try {
            res.send(deleteFolder(req.body.folder))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/folder/rename', checkIfAuthenticated, (req, res) => {
    if (!req.body.folder || !req.body.newFolder) res.sendStatus(400).send()
    else {
        try {
            res.send(renameFolder(req.body.folder, req.body.newFolder))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})

// Any other route serves the frontend
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist/MarkD/index.html')
});

//Set Port
let HTTP_PORT = process.env.PORT || 8080;

//Start Server
app.listen(HTTP_PORT, function () {
    console.log(`App running on port ${HTTP_PORT}.`)
});