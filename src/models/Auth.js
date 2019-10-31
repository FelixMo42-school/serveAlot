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
                next()
            })
    }

    getUser(username, password) {
        return new Promise(async (resolve, reject) => {
            let user = await User.findOne({username})
            if (!user) {
                return reject("user dosent exist")
            }

            let validPassword = await user.checkPassword(password)
            if (!validPassword) {
                return reject("invalid password")
            }

            resolve(user)
        })
    }

    confirmPassword(user, password) {
        return user.checkPassword(password)
    }

    login(username, password) {
        return new Promise(async (resolve, reject) => {
            let user = await this.getUser(username, password)
                .then(user => {
                    return user
                })
                .catch(err => {
                    reject(err)
                })

            if (!user) {return}

            let sessionId = uuid()
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
                    let sessionId = uuid()
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

    updatePassword(session, newPassword, oldPassword) {
        return new Promise(async (resolve, reject) => {
            if ( await this.confirmPassword( session.user, oldPassword ) ) {
                session.user.password = newPassword
                session.user.save()
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        reject(err)
                    })
            } else {
                reject("wrong password")
            }
        })
    }

    logout(session) {
        if (session) {
            session.remove()
        }
    }
}

module.exports = Auth