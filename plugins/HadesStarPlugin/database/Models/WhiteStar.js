import {Schema, model} from 'mongoose';

const WhiteStarSchema = Schema ({
    Corp: {type: Schema.Types.ObjectId, ref: "Corp"},
    author:String,
    wsrole: String,
    description: String,
    recruitmessage: String,
    retruitchannel: String,
    status: String,
    members: [{type: Schema.Types.ObjectId, ref: "Member"}],
    preferences:{type: Map,
        of: String}
})

export const WhiteStar = model("WhiteStar", WhiteStarSchema, "WhiteStar")