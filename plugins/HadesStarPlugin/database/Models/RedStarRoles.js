import {Schema, model} from 'mongoose';

const RedStarRolesSchema = Schema ({
    corpId: String,
    redStarRoles: {type: Map,
        of: String},
})

export const RedStarRoles = model("RedStarRole", RedStarRolesSchema, "RedStarRole")