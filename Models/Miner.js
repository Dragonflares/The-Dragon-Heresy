const {Schema, model} = require('mongoose')

const Miner = Schema ({
    name: String,
<<<<<<< 5c9602f204adb29178889aec39bdc1adc3d9300d
    level: Int32Array,
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
=======
    level: {type: Number,
        default: 0},
    support: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
>>>>>>> Bot version 1.0! Release to public
    mining: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Miner", Miner)