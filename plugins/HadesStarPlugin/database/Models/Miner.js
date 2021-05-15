import {Schema, model} from 'mongoose';

const MinerSchema = Schema ({
    name: String,
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
    mining: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

export const Miner = model("Miner", MinerSchema, "Miner")