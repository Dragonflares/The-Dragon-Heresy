import {Schema, model} from 'mongoose';

const ShipyardLevelsSchema = Schema ({
    battleshiplevel: {type: Number,
        default: 1},
    minerlevel: {type: Number,
        default: 1},
    transportlevel: {type: Number,
        default: 1},
})

export const ShipyardLevels = model("ShipyardLevels", ShipyardLevelsSchema, "ShipyardLevels")