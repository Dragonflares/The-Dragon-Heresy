import pkg from 'mongoose';
const {Schema, model} = pkg;

const TechSchema = Schema ({
    name: String,
    level: Number,
    category: String,
    order: Number,
    playerId: String
})

export const Tech = model("Tech", TechSchema, "Tech")