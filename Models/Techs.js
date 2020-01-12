const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Tech = Schema ({
    name: String,
    level: String,
    category: String,
    order: Number,
    playerId: String
})

module.exports = model("Tech", Tech, "Tech")