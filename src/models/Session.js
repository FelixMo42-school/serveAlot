const mongoose = require('mongoose')
const Schema   = mongoose.Schema

let sessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now
    }
})

module.exports = mongoose.model('session', sessionSchema)