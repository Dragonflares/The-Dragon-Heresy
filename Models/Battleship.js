const {Schema, model} = require('mongoose')

const Battleship = Schema ({
    name: String,
<<<<<<< 5c9602f204adb29178889aec39bdc1adc3d9300d
    level: Int32Array,
    weapon: {type: Schema.Types.ObjectId, ref: 'Tech'},
    shield: {type: Schema.Types.ObjectId, ref: 'Tech'},
    support: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
=======
    level: {type: Number,
        default: 0},
    weapon: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    shield: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    support: [
        {type: Mongoose.Types.ObjectId, ref: 'Tech'}
>>>>>>> Bot version 1.0! Release to public
    ]
})

module.exports = model("Battleship", Battleship)