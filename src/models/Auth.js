const jwt      = require("jsonwebtoken")
const bcrypt   = require("bcrypt")
const uuid     = require("uuid/v4")
const User     = require("./User")
const Session  = require("./Session")

let defaultUser = {}

class Auth {
    constructor(app) {
        
    }

    authenticate(req, res, next) {
        let sessionId = req.cookies.session

        if (!sessionId) {
            return next()
        }

        Session.findOne({sessionId})
            .then(async session => {
                req.session = session
                req.user = await User.findOne({username: session.username})
                next()
            })
            .catch(err => {
                next()
            })
    }

    login(username, password) {
        return new Promise(async (resolve, reject) => {
            let user = await User.findOne({username})
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
                .then(() => {
                    resolve(session)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    // res.cookie("session", sessionId, { httpOnly: true , secure: true })

    register(username, password) {
        return new Promise(async (resolve, reject) => {
            if ( await User.exists({username}) ) {
                reject("username allready taken")
            }

            let user = new User({username, password})
            user.save()
                .then(() => {
                    let sessionId = uuid() //TODO: sign it!
                    let session = new Session({sessionId, username})
                    session.save()
                        .then(() => {
                            resolve(session)
                        })
                        .catch(err => {
                            reject(err)
                        })
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    logout(session) {
        session.remove()
    }
}

module.exports = Auth