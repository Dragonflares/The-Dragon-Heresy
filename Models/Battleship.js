const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Battleship = Schema ({
    name: String,
    level: {type: Number,
        default: 0},
    weapon: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    shield: {type: Mongoose.Types.ObjectId, ref: 'Tech'},
    support: [
        {type: Mongoose.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Battleship", Battleship, "Battleship")