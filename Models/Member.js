const {Schema, model} = require('mongoose')

const Member = Schema ({
    name: String,
<<<<<<< 5c9602f204adb29178889aec39bdc1adc3d9300d
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
=======
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
    miner: { type: Mongoose.Types.ObjectId, ref: 'Miner' }
>>>>>>> Bot version 1.0! Release to public
})

module.exports = model("Member", Member)