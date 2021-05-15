import {Schema, model} from 'mongoose';

const MemberSchema = Schema ({
    name: String,
    discordId:{ 
        type: String,
        required: true,
        unique: true
    },
    Corp: {type: Schema.Types.ObjectId, ref: "Corp"},
    timezone: {type: String,
        default: "+0"},
    techs: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
    shipyard: [{ type: Schema.Types.ObjectId, ref: 'Shipyard'}],
    online: {type: Boolean,
        default: false},
    lastSeen: {type: Date},
    lastCroid:{type: Date, default: ""},
    awayTime: {type: Date, default: Date.now()},
    awayDesc: {type: String , default: "Away"}
})

export const Member = model("Member", MemberSchema, "Member")