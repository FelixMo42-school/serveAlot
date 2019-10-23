const express      = require('express')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const mongoose     = require('mongoose')
const dotenv       = require('dotenv')

dotenv.config()

mongoose.connect(
    `mongodb+srv://${process.env.SERVER_USERNAME}:${process.env.SERVER_PASSWORD}@servealot-iq7ib.mongodb.net/test`,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }
)

const Auth = require('./models/Auth')
const auth = new Auth()

const app = express()
    .set('view engine', 'ejs')
    //.use(express.static('public'))
    //.use(bodyParser.json({}))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser( process.env.SECRET ))
    .use(helmet())
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
            res.cookie('session', session.sessionId, { httpOnly: true, signed: true }) // do secure once https
            res.redirect("/")
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
            res.cookie('session', session.sessionId, { httpOnly: true, signed: true }) // do secure once https
            res.redirect("/")
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

app.get("/", (req, res) => {
    if (req.session) {
        res.render("pages/root", {
            title: "home",
            user: req.session.user,
            parts: [
                {name: "msg", msg: `Hello ${req.session.user.username}`}
            ]
        })
    } else {
        res.render("pages/root", {
            title: "home",
            parts: [
                {name: "alert", level: "info", msg: `You're not loged in.`}
            ]
        })
    }
})

app.listen(process.env.PORT, () => {
    console.log(`[app] Listening at localhost:${process.env.PORT}`)
})