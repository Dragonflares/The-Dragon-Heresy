const {Schema, model} = require('mongoose')

const Member = Schema ({
    name: String,
    rank: String,
    rslevel: String,
    wsStatus: String,
    Corp: {type: Schema.Types.ObjectId, ref: 'Corp'},
    timezone: String,
    Battleship: {type: Schema.Types.ObjectId, ref: 'Battleship'},
    Miner: {type: Schema.Types.ObjectId, ref: 'Miner'},
    Transport: {type: Schema.Types.ObjectId, ref: 'Transport'},
    SupportShip: String,
    techs: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Member", Member)