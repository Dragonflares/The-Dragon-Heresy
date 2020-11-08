import { Schema, model } from 'mongoose';

const WhiteStarSchema = Schema({
    Corp: { type: Schema.Types.ObjectId, ref: "Corp" },
    author: { type: Schema.Types.ObjectId, ref: "Member" },
    wsrole: String,
    description: String,
    recruitmessage: String,
    retruitchannel: String,
    statusmessage: String,
    statuschannel: String,
    scantime: { type: Date },
    matchtime: { type: Date },
    status: String,
    members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    preferences: {
        type: Map,
        of: String
    },
    leadPreferences: {
        type: Map,
        of: String
    },
    bsGroupsRoles: {
        type: Array,
        of: String
    },
    spGroupsRoles: {
        type: Array,
        of: String
    },
    groupNotes: {
        type: Map,
        of: String
    },
    playerBsNotes: {
        type: Map,
        of: String
    },
    playerSpNotes: {
        type: Map,
        of: String
    }
})

export const WhiteStar = model("WhiteStar", WhiteStarSchema, "WhiteStar")