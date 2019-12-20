const {Schema, model} = require('mongoose')

const Tech = Schema ({
    name: String,
    level: String,
    category: String,
    order: Int32Array
})

module.exports = model("Tech", Tech)