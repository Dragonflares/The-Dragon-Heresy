const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Member = Schema ({
    name: String,
    discordId:{ 
        type: String,
        required: true,
        unique: true
    },
    rank: {type: String,
        default: "Member"},
    rslevel: {type: Number,
        default: 1},
    wsStatus: {type: String,
        default: "No"},
    Corp: {type: Mongoose.Types.ObjectId, ref: "Corp"},
    timezone: {type: String,
        default: "+0"},
    SupportShip: {type: String,
        default: ""},
    battlegroupRank: {type: String,
        default: ""},
    techs: [{ type: Mongoose.Types.ObjectId, ref: 'Tech' }],
    battleship: { type: Mongoose.Types.ObjectId, ref: 'Battleship' },
    transport: { type: Mongoose.Types.ObjectId, ref: 'Transport' },
    miner: { type: Mongoose.Types.ObjectId, ref: 'Miner' },
    lastSeen: {type: Date}
})

module.exports = model("Member", Member, "Member")