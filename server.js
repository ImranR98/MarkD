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
const boardsPath = `${userDataDir}/boards.json`
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

const getBoards = () => {
	let boards = []
	if (fs.existsSync(boardsPath)) {
		try {
			boards = JSON.parse(fs.readFileSync(boardsPath).toString())
		} catch (err) {
			console.log(err)
			fs.unlinkSync(boardsPath)
		}
	}
	return boards
}
const saveBoards = (boards) => {
	fs.writeFileSync(boardsPath, JSON.stringify(boards, null, '\t'))
}
const getCategories = () => {
    return [''].concat(fs.readdirSync(notesDir).filter(file => fs.statSync(`${notesDir}/${file}`).isDirectory())).map(category => {
        return {
            category: category,
            categories: fs.readdirSync(`${notesDir}/${category}`).filter(file => file.toLowerCase().endsWith('.md'))
        }
    })
}
const getCategory = (category) => {
    let target = `${notesDir}${category ? `/${category}` : ''}`
    if (fs.existsSync(target)) {
        if (fs.statSync(target).isDirectory()) {
            let data = {
                category: category,
                categories: fs.readdirSync(target).filter(fileName => fileName.toLowerCase().endsWith('.md')).map(fileName => {
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
const getNote = (category, fileName) => {
    let stats = fs.statSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`)
    return {
        info: {
            fileName: fileName,
            modified: stats.mtime,
            created: stats.ctime
        },
        category: category ? category : '',
        data: fs.readFileSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`).toString()
    }
}
const saveNote = (category, fileName, noteData) => {
    fs.writeFileSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`, noteData ? noteData : '')
}
const deleteNote = (category, fileName) => {
    fs.unlinkSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`)
}
const renameNote = (category, fileName, newName) => {
    fs.renameSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`, `${notesDir}/${category ? category + '/' : ''}${newName}`)
}
const moveNote = (category, fileName, toCategory) => {
    if (category != toCategory) {
        fs.copyFileSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`, `${notesDir}/${toCategory ? toCategory + '/' : ''}${fileName}`)
        fs.unlinkSync(`${notesDir}/${category ? category + '/' : ''}${fileName}`)
    }
}
const createCategory = (category) => {
    fs.mkdirSync(`${notesDir}/${category}`)
}
const deleteCategory = (category) => {
    fs.rmdirSync(`${notesDir}/${category}`)
}
const renameCategory = (category, newCategory) => {
    if (category && newCategory) {
        fs.renameSync(`${notesDir}/${category}`, `${notesDir}/${newCategory}`)
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

app.get('/boards', checkIfAuthenticated, (req, res) => {
	try {
		res.send(getBoards())
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})
app.post('/boards', checkIfAuthenticated, (req, res) => {
	if (req.body.boards) {
		try {
			res.send(saveBoards(req.body.boards))
		} catch (err) {
			console.log(err)
			res.status(500).send(err)
		}
	} else {
		res.status(400).send()
	}
})
app.get('/categories', checkIfAuthenticated, (req, res) => {
    try {
        res.send(getCategories())
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send(err)
    }
})
app.post('/note/get', checkIfAuthenticated, (req, res) => {
    if (!req.body.fileName) res.sendStatus(400).send()
    else {
        try {
            res.send(getNote(req.body.category, req.body.fileName))
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
            res.send(saveNote(req.body.category, req.body.fileName, req.body.data))
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
            res.send(deleteNote(req.body.category, req.body.fileName))
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
            res.send(moveNote(req.body.category, req.body.fileName, req.body.toCategory))
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
            res.send(renameNote(req.body.category, req.body.fileName, req.body.newName))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/category/get', checkIfAuthenticated, (req, res) => {
    try {
        res.send({ category: getCategory(req.body.category), categories: getCategories() })
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send(err)
    }
})
app.post('/category/create', checkIfAuthenticated, (req, res) => {
    if (!req.body.category) res.sendStatus(400).send
    else {
        try {
            res.send(createCategory(req.body.category))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})

app.post('/category/delete', checkIfAuthenticated, (req, res) => {
    if (!req.body.category) res.sendStatus(400).send
    else {
        try {
            res.send(deleteCategory(req.body.category))
        } catch (err) {
            console.log(err)
            res.sendStatus(500).send(err)
        }
    }
})
app.post('/category/rename', checkIfAuthenticated, (req, res) => {
    if (!req.body.category || !req.body.newCategory) res.sendStatus(400).send()
    else {
        try {
            res.send(renameCategory(req.body.category, req.body.newCategory))
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