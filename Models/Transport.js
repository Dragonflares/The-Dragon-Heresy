const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Transport = Schema ({
    name: String,
    level: Number,
    support: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    economy: [
        {type: Mongoose.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Transport", Transport, "Transport")