const uuid     = require("uuid/v4")
const User     = require("./User")
const Session  = require("./Session")

class Auth {
    constructor(app) {
        
    }

    authenticate(req, res, next) {
        let sessionId = req.signedCookies.session

        if (!sessionId) {
            return next()
        }

        Session.findOne({sessionId}).populate('user')
            .then(session => {
                req.session = session
                next()
            })
            .catch(err => {
                req.user = false
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
            let session = new Session({sessionId, user: user._id})
            session.save()
                .then(() => {
                    resolve(session)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    register(username, password) {
        return new Promise(async (resolve, reject) => {
            if ( await User.exists({username}) ) {
                reject("username allready taken")
            }

            let user = new User({username, password})
            user.save()
                .then(() => {
                    let sessionId = uuid() //TODO: sign it!
                    let session = new Session({
                        sessionId: sessionId,
                        user: user._id
                    })
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
        if (session) {
            session.remove()
        }
    }
}

module.exports = Auth