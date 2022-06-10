import pkg from 'mongoose';
const {Schema, model} = pkg;

const WhiteStarSchema = Schema({
    Corp: { type: Schema.Types.ObjectId, ref: "Corp" },
    author: { type: Schema.Types.ObjectId, ref: "Member" },
    wsrole: String,
    description: String,
    corporation: String,
    nature: String,
    expectedtime: Date,
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
    groupsRoles: { type: Schema.Types.ObjectId, ref: "WhiteStarRoles"},
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