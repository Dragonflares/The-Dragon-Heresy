import pkg from 'mongoose';
const {Schema, model} = pkg;

const RedStarMessageSchema = Schema ({
    rolesMessage: String,
    rolesMessageChannel: String,
})

export const RedStarMessage = model("RedStarMessage", RedStarMessageSchema, "RedStarMessage")