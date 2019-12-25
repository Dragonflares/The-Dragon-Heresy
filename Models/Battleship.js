const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Battleship = Schema ({
    name: String,
    level: Number,
    weapon: {type: Mongoose.Types.ObjectId, ref: 'Techs'},
    shield: {type: Mongoose.Types.ObjectId, ref: 'Techs'},
    support: [
        {type: Mongoose.Types.ObjectId, ref: 'Techs'}
    ]
})

module.exports = model("Battleship", Battleship, "Battleship")