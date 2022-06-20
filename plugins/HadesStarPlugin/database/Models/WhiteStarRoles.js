import pkg from 'mongoose';
const {Schema, model} = pkg;

const WhiteStarRolesSchema = Schema ({
    Corp: {type: Schema.Types.ObjectId, ref: "Corp"},
    wsrole: String,
    bsGroupsRoles: {
        type: Array,
        of: String
    },
    spGroupsRoles: {
        type: Array,
        of: String
    },
})

export const WhiteStarRoles = model("WhiteStarRoles", WhiteStarRolesSchema, "WhiteStarRoles")