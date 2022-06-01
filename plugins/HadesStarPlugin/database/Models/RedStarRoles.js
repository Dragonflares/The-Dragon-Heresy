import pkg from 'mongoose';
const {Schema, model} = pkg;

const RedStarRolesSchema = Schema ({
    corpId: String,
    redStarRoles: {type: Map,
        of: String},
})

export const RedStarRoles = model("RedStarRole", RedStarRolesSchema, "RedStarRole")