const {Schema, model} = require('mongoose')

const Miner = Schema ({
    name: String,
    level: Int32Array,
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
    mining: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Miner", Miner)