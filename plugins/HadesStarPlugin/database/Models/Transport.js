import {Schema, model} from 'mongoose';

const TransportSchema = Schema ({
    name: String,
    level: {type: Number,
        default: 0},
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
    economy: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

export const Transport = model("Transport", TransportSchema, "Transport")