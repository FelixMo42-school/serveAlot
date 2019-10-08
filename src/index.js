const express = require('express')
const expressSession = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const cors = require('cors')

const port = 3000

var data = {name: "bla"}

var app = express()
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
    if (req.body.username == "admin" && req.body.password == "123") {
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