const jwt      = require("jsonwebtoken")
const bcrypt   = require("bcrypt")
const uuid     = require("uuid/v4")
const User     = require("./User")
const Session  = require("./Session")

let defaultUser = {}

class Auth {
    constructor(app) {
        
    }

    authenticate(res, req, next) {
        let token = req.cookies.session

        if (!token) {
            req.user = false
            return next()
        }

        jwt.verify(token, process.env.SECRET, (err, data) => {
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

    login(username, password) {
        return new Promise((resolve, reject) => {
            let user = User.findOne({username})
            if (!user) {
                reject("user dosent exist")
            }

            let validPassword = await user.checkPassword(password)
            if (!validPassword) {
                reject("invalid password")
            }

            let sessionId = uuid() //TODO: sign it!
            let session = new Session({sessionId, username})
            session.save()

            resolve(session)
        })
    }

    // res.cookie("session", sessionId, { httpOnly: true , secure: true })

    register(username, password) {
        if ( User.exists({username}) ) {
            return "username allready taken"
        }

        let user = new User({username, password})
        await user.save()
    }
}

module.exports = Auth