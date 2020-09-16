import {Schema, model} from 'mongoose';

const BattleshipSchema = Schema ({
    name: String,
    level: {type: Number,
        default: 0},
    weapon: {type: Schema.Types.ObjectId, ref: 'Tech'},
    shield: {type: Schema.Types.ObjectId, ref: 'Tech'},
    support: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

export const Battleship = model("Battleship", BattleshipSchema, "Battleship")