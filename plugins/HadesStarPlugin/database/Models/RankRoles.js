import {Schema, model} from 'mongoose';

const RankRolesSchema = Schema ({
    corpId: String,
    trader: String,
    mercenary: String,
    member: String,
    officer: String,
    whiteStarCommander: String,
    firstOfficer: String,
})

export const RankRoles = model("RankRole", RankRolesSchema, "RankRole")