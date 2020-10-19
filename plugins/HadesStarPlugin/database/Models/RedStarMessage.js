import {Schema, model} from 'mongoose';

const RedStarMessageSchema = Schema ({
    rolesMessage: String,
    rolesMessageChannel: String,
})

export const RedStarMessage = model("RedStarMessage", RedStarMessageSchema, "RedStarMessage")