const mongoose   = require('mongoose')

const gameSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('2048', gameSchema)