const express      = require('express')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const cors         = require('cors')
const mongoose     = require('mongoose')
const dotenv       = require('dotenv')

dotenv.config()
const Auth = require('./models/Auth')
const auth = new Auth()

mongoose.connect(
    `mongodb+srv://${process.env.SERVER_USERNAME}:${process.env.SERVER_PASSWORD}@servealot-iq7ib.mongodb.net/test`,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }
)

const port = 3100
const saltRounds = 10
const secret = "secret"
const users = []

const app = express()
    .set('view engine', 'ejs')
    //.use(express.static('public'))
    //.use(bodyParser.json({}))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser())
    //.use(helmet())
    //.use(cors())
    .use(auth.authenticate)
    

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

    auth.login(username, password)
        .then((session) => {
            res.cookie('session', session.sessionId, { httpOnly: true }) // do secure once https
            res.redirect("/home")
        })
        .catch((error) => {
            res.render("pages/root", {
                title: "login",
                user: req.user,
                parts: [
                    {name: "alert", level: "danger", msg: error},
                    {name: "login"}
                ]
            })
        })
})

app.post("/register", async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    auth.register(username, password)
        .then((session) => {
            res.cookie('session', session.sessionId, { httpOnly: true }) // do secure latter
            res.redirect("/home")
        })
        .catch((error) => {
            res.render("pages/root", {
                title: "login",
                user: req.user,
                parts: [
                    {name: "alert", level: "danger", msg: error},
                    {name: "login"}
                ]
            })
        })
})

app.get("/logout", (req, res) => {
    auth.logout(req.session)
    res.redirect("login")
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