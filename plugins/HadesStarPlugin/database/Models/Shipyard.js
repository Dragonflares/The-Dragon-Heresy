import pkg from 'mongoose';
const {Schema, model} = pkg;

const ShipyardSchema = Schema ({
    battleshiplevel: Number,
    minerlevel: Number,
    transportlevel: Number,
    SupportShip: {type: String,
        default: ""},
    Transports: [{ type: Schema.Types.ObjectId,
        ref: 'Transport' }],
    Miners: [{ type: Schema.Types.ObjectId,
        ref: 'Miner' }],
    Battleships: [{ type: Schema.Types.ObjectId,
        ref: 'Battleship' }]
})

export const Miner = model("Shipyard", ShipyardSchema, "Shipyard")