import pkg from 'mongoose';
const {Schema, model} = pkg;

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