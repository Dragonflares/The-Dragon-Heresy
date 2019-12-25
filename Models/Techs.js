const {Schema, model} = require('mongoose')

const Tech = Schema ({
    name: String,
    level: Number,
    category: String,
    order: Number,
    playerId: Number
})

module.exports = model("Tech", Tech, "Tech")