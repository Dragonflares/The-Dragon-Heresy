const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Miner = Schema ({
    name: String,
    level: {type: Number,
        default: 0},
    support: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    mining: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Miner", Miner, "Miner")