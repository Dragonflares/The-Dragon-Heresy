const {Schema, model} = require('mongoose')

const Battleship = Schema ({
    name: String,
    level: Int32Array,
    weapon: {type: Schema.Types.ObjectId, ref: 'Tech'},
    shield: {type: Schema.Types.ObjectId, ref: 'Tech'},
    support: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Battleship", Battleship)