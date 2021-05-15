import {Schema, model} from 'mongoose';

const BattlegroupSchema = Schema ({
    Corp: String,
    name: String,
    captain: {
        type: Schema.Types.ObjectId, ref: 'Member'
    },
    members: [{
        type: Schema.Types.ObjectId, ref: 'Member'
    }],
    Battlemap: {
        type: Schema.Types.ObjectId, ref: 'Battlemap'
    },
    textchannel: {
        type: String
    }
})

export const Battlegroup = model("Battlegroup", BattlegroupSchema, "Battlegroup")