const express      = require('express')
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const mongoose     = require('mongoose')
const dotenv       = require('dotenv')
const compression  = require("compression")

dotenv.config()

mongoose.connect(
    `mongodb+srv://${process.env.SERVER_USERNAME}:${process.env.SERVER_PASSWORD}@servealot-iq7ib.mongodb.net/test`,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }
)

const Auth = require('./models/Auth')
const Game = require('./models/Game')
const api  = require('./models/api')

const auth = new Auth()

const app = express()
    .set('view engine', 'ejs')
    .use(compression())
    .use(express.static('public'))
    .use(bodyParser.urlencoded({extended: true}))
    .use(cookieParser( process.env.SECRET ))
    .use(helmet())
    .use(auth.authenticate)

const server = require('http').createServer(app)  

const io = new api(server, auth)

app.get("/login", async (req, res) => {
    res.render("pages/root", {
        title: "login",
        session: req.session,
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
            res.cookie(
                'session',
                session.sessionId,
                { httpOnly: true, signed: true }
            ) // do secure once https
            res.redirect("/")
        })

        .catch((error) => {
            res.render("pages/root", {
                title: "login",
                session: req.session,
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
            res.cookie(
                'session',
                session.sessionId,
                { httpOnly: true, signed: true }
            ) // do secure once https
            res.redirect("/")
        })
        .catch((error) => {
            res.render("pages/root", {
                title: "login",
                session: req.session,
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

app.get("/", async (req, res) => {
    let parts = []

    if (req.session) {
        parts.push({name: "msg", msg: `Hello ${req.session.user.username}`})
    }

    parts.push({
        name: "home",
        games: await Game.find().sort([["score", -1]]).limit(100).populate('user')
    })

    res.render("pages/root", {
        title: "home",
        session: req.session,
        parts: parts
    })
})

const updatePasswordForm = {
    name: "form",
    action: "/updatePassword",
    method: "POST",
    inputs: [
        {
            name: "new_password",
            question: "new password",
            placeholder: "new password",
            type: "password"
        },
        {
            name: "old_password",
            question: "old password",
            placeholder: "old password",
            type: "password"
        }
    ]
}

app.get("/profile", async (req, res) => {
    if ( !req.session ) { return res.status(403).redirect("/") }

    res.render("pages/root", {
        title: "profile",
        session: req.session,
        parts: [
            updatePasswordForm
        ]
    })
})

app.post("/updatePassword", async (req, res) => {
    if ( !req.session ) { return res.status(403).redirect("/") }

    auth.updatePassword(
        req.session,
        req.body.new_password,
        req.body.old_password,
    )
        .then(() => {
            res.redirect("/")
        })
        .catch(error => {
            es.render("pages/root", {
                title: "profile",
                session: req.session,
                parts: [
                    {name: "alert", level: "danger", msg: error},
                    updatePasswordForm
                ]
            })
        })
})

app.post("/deleteGame", async (req, res) => {
    if ( !req.session ) { return res.status(403).send("no") }

    await Game.deleteOne({
        user: req.session.user.id,
        _id: req.body.id
    }).catch(() => {
        res.send("fail")
    }).then(() => {
        res.send("suc")
    })
})

server.listen(process.env.PORT, () => {
    console.log(`[app] Listening at localhost:${process.env.PORT}`)
})