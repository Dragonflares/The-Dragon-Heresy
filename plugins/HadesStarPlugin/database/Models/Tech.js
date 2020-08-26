import {Schema, model} from 'mongoose';

const TechSchema = Schema ({
    name: String,
    level: String,
    category: String,
    order: Number,
    playerId: String
})

export const Tech = model("Tech", TechSchema, "Tech")