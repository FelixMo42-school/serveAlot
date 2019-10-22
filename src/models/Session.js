const mongoose = require('mongoose')
const Schema   = mongoose.Schema

let sessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now
    }
})

module.exports = mongoose.model('session', sessionSchema)