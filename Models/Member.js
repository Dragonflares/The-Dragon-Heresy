const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Member = Schema ({
    name: String,
    discordId:{ 
        type: Number,
        required: true,
        unique: true
    },
    rank: String,
    rslevel: Number,
    wsStatus: String,
    Corp: {type: Mongoose.Types.ObjectId, ref: "Corp"},
    timezone: String,
    SupportShip: String,
    techs: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
    battleship: { type: Schema.Types.ObjectId, ref: 'Battleship' },
    transport: { type: Schema.Types.ObjectId, ref: 'Transport' },
    miner: { type: Schema.Types.ObjectId, ref: 'Miner' }
})

module.exports = model("Member", Member, "Member")