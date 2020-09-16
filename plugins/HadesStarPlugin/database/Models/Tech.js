import {Schema, model} from 'mongoose';

const TechSchema = Schema ({
    name: String,
    level: Number,
    category: String,
    order: Number,
    playerId: String
})

export const Tech = model("Tech", TechSchema, "Tech")