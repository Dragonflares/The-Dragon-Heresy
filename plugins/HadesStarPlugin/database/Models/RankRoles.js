import pkg from 'mongoose';
const {Schema, model} = pkg;

const RankRolesSchema = Schema ({
    corpId: String,
    Guest: {type: String,
        default: ''},
    Trader: {type: String,
        default: ''},
    Mercenary: {type: String,
        default: ''},
    Member: {type: String,
        default: ''},
    Officer: {type: String,
        default: ''},
    WhiteStarCommander: {type: String,
        default: ''},
    FirstOfficer: {type: String,
        default: ''}
})

export const RankRoles = model("RankRole", RankRolesSchema, "RankRole")