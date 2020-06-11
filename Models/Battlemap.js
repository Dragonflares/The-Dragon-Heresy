const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Battlemap = Schema ({
    waypoints: [{
        type: Schema.Types.ObjectId, ref: Coordinate
    }]
    
})

module.exports = model("Battlemap", Battlemap, "Battlemap")