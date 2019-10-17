const mongoose = require('mongoose')
const bcrypt   = require('bcrypt')
const Schema   = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    created_at: {
        type: Date,
        required: true
    }  
})

userSchema.pre("save", function (next) {
    let user = this

    if (user.isModified("password")) {
        bcrypt.hash(user.password, 10).then((hash) => {
            user.password = hash
            next()
        })
    } else {
        next()
    }
})

userSchema.method.checkPassword = async function(password) {
    return bcrypt.compare(password, user.password)
}

module.exports = mongoose.model('user', userSchema)