const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Coordinate = Schema ({
    line: String,
    number: Number,
    type: String,
    player: {
        type: Schema.Types.ObjectId,
        ref: "Member",
        default: null
    },
    friendly: {
        type: Boolean,
        default: null
    }
})

module.exports = model("Coordinate", Coordinate, "Coordinate")