import {Schema, model} from 'mongoose';

const MemberSchema = Schema ({
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
    Corp: {type: Schema.Types.ObjectId, ref: "Corp"},
    timezone: {type: String,
        default: "+0"},
    SupportShip: {type: String,
        default: ""},
    battlegroupRank: {type: String,
        default: ""},
    techs: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
    battleship: { type: Schema.Types.ObjectId, ref: 'Battleship' },
    transport: { type: Schema.Types.ObjectId, ref: 'Transport' },
    miner: { type: Schema.Types.ObjectId, ref: 'Miner' },
    online: {type: Boolean,
        default: false},
    lastSeen: {type: Date},
    lastCroid:{type: Date, default: ""},
    awayTime: {type: Date, default: Date.now()},
    awayDesc: {type: String , default: "Away"}
})

export const Member = model("Member", MemberSchema, "Member")