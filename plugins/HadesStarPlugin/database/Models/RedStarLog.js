import pkg from 'mongoose';
const {Schema, model} = pkg;

const RedStarLogSchema = Schema ({
    corpOpened: {type: Schema.Types.ObjectId, ref: "Corp"},
    level:  {
        type: Number,
        default: 0
    },
    timeClosed: {type: Date},
    endStatus: String,
    creatorId: String,
    membersIds: [String]
})

export const RedStarLog = model("RedStarLog", RedStarLogSchema, "RedStarLog")