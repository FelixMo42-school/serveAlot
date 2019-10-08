'use strict'

const express      = require('express')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const cors         = require('cors')
const jwt          = require('jsonwebtoken')
const uuid         = require("uuid/v4")

const port = 3000

const secret = "secret"

const app = express()
    .set('view engine', 'ejs')
    .use(express.static('public'))
    .use(bodyParser.json({}))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser())
    .use(helmet())
    .use(cors())

let users = [
    {username: "admin", password: "123", secret: "admin secret"},
    {username: "guest", password: "guest", secret: "guest secret"}
]

app.post("/login", (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let user = users.find((user) =>
        user.username == username && user.password == password
    )

    if ( !user ) {
        res.send({
            success: false
        })
    }

    //TODO: what if allready uid

    user.uid = uuid()

    let data = {
        uid: user.uid,
        username: username
    }

    let token = jwt.sign(data, secret, { expiresIn: "1h" })

    res.cookie('session', token)

    res.send({
        success: true
    })
})

app.post("/logout", (req, res) => {
    let token = req.cookies.session

    jwt.verify( token, secret, (err, data) => {
        if (err) {
            res.status(500)
            return res.send(err)
        }

        let user = users.find((user) =>
            user.uid == data.uid
        )

        if (!user) {
            return res.send("no user")
        }

        delete user.uid

        res.send({})
    })
    res.clearCookie()
})

app.get("/username", (req, res) => {
    let token = req.cookies.session

    jwt.verify( token, secret, (err, data) => {
        if (err) {
            res.status(500)
            return res.send(err)
        }

        let user = users.find((user) =>
            user.uid == data.uid
        )

        if (!user) {
            res.status(500)
            return res.send("no user")
        }

        res.send( {
            username: user.username
        } )
    } )
})

app.listen(port)
console.log(`[app] Listening at localhost:${port}`)