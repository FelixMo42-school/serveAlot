const express      = require('express')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const cors         = require('cors')
const jwt          = require('jsonwebtoken')
const bcrypt       = require('bcrypt')
const uuid         = require("uuid/v4")
const mongoose     = require('mongoose')
const dotenv       = require('dotenv')

dotenv.config()

mongoose.connect(
    `mongodb+srv://${process.env.SERVER_USERNAME}:${process.env.SERVER_PASSWORD}@servealot-iq7ib.mongodb.net/test`,
    { useNewUrlParser: true, useUnifiedTopology: true }
)

const port = 3100
const saltRounds = 10
const secret = "secret"
const users = []
const User = mongoose.model('user', {username: String, password: String})

function auth() {
    return (req, res, next) => {
        let token = req.cookies.session

        if (!token) {
            req.user = false
            return next()
        }

        jwt.verify(token, secret, (err, data) => {
            if (err) {
                return res.send({
                    err: err
                })
            }

            let user = users.find((user) =>
                user.uid == data.uid
            )

            if (typeof user != "undefined") {
                req.user = user
            } else {
                req.user = false
            } 

            next()
        })
    }
}

const app = express()
    .set('view engine', 'ejs')
    .use(express.static('public'))
    .use(bodyParser.json({}))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser())
    .use(helmet())
    .use(cors())
    .use(auth())

app.get("/login", async (req, res) => {
    res.render("pages/root", {
        title: "login",
        user: req.user,
        parts: [
            {name: "login"}
        ]
    })
})

app.post("/login", async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if ( typeof username != "string" || typeof password != "string" ) {
        return res.render("pages/root", {
            title: "login",
            parts: [
                {name: "alert", level: "danger", msg: "requirems username and password"},
                {name: "login"}
            ]
        })
    }

    let user = users.find((user) => user.username == username)

    if ( !user ) {
        return res.render("pages/root", {
            title: "login",
            user: req.user,
            parts: [
                {name: "alert", level: "danger", msg: "invalid username"},
                {name: "login"}
            ]
        })
    }

    let match = await bcrypt.compare(password, user.password)

    if ( !match ) {
        return res.render("pages/root", {
            title: "login",
            user: req.user,
            parts: [
                {name: "alert", level: "danger", msg: "wrong password"},
                {name: "login"}
            ]
        })
    }

    user.uid = uuid()

    let data = { uid: user.uid }

    let token = jwt.sign(data, secret, { expiresIn: "1h" })

    res.cookie('session', token)
    res.redirect("/home")
})

app.post("/register", async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if ( typeof username != "string" || typeof password != "string" ) {
        return res.render("pages/root", {
            title: "login",
            user: req.user,
            parts: [
                {name: "alert", level: "danger", msg: "requirems username and password"},
                {name: "login"}
            ]
        })
    }

    if ( users.find((user) => user.username == username) ) {
        return res.render("pages/root", {
            title: "login",
            user: req.user,
            parts: [
                {name: "alert", level: "danger", msg: "username already taken"},
                {name: "login"}
            ]
        })
    }

    let user = {
        username: username,
        password: await bcrypt.hash(password, saltRounds),
        uid: uuid()
    }

    users.push(user)

    let data = { uid: user.uid }

    let token = jwt.sign(data, secret, { expiresIn: "1h" })

    res.cookie('session', token)
    res.redirect("/home")
})

app.get("/logout", (req, res) => {
    let token = req.cookies.session

    jwt.verify( token, secret, (err, data) => {
        if (err) {
            return res.redirect("/home")
        }

        let user = users.find((user) =>
            user.uid == data.uid
        )

        if (!user) {
            return res.redirect("/home")
        }

        delete user.uid

        res.clearCookie()
        res.redirect("/home")
    })
})

app.get("/home", (req, res) => {
    if (req.user) {
        res.render("pages/root", {
            title: "home",
            user: req.user,
            parts: [
                {name: "msg", msg: `Hello ${req.user.username}`}
            ]
        })
    } else {
        res.render("pages/root", {
            title: "home",
            user: req.user,
            parts: [
                {name: "alert", level: "info", msg: `You're not loged in.`}
            ]
        })
    }
})

app.listen(port)
console.log(`[app] Listening at localhost:${port}`)