const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Miner = Schema ({
    name: String,
    level: Number,
    support: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    mining: [
        {type: Mongoose.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Miner", Miner, "Miner")