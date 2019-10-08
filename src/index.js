const express = require('express')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')

const port = 3000

let users = [
    {username: "admin", password: "123"},
    {username: "guest", password: "guest"}
]

let app = express()
    .set('view engine', 'ejs')
    .use(express.static('public'))
    .use(bodyParser.json({}))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser())
    .use(helmet())
    .use(cors())
    .use(expressSession({
        secret: "iamapassword"
    }))

app.post("/login", (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if ( users.find((user) => user.username == username && user.password == password) ) {
        res.cookie('logedIn' , true)
        res.send({
            success: true
        })
    } else {
        res.send({
            success: false
        })
    }
})

app.listen(port)
console.log(`[app] Listening at localhost:${port}`)