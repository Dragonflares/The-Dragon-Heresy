import pkg from 'mongoose';
const {Schema, model} = pkg;

const MinerSchema = Schema ({
    name: String,
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
    mining: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

export const Miner = model("Miner", MinerSchema, "Miner")