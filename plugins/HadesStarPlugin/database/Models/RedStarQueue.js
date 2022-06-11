import pkg from 'mongoose';
const {Schema, model} = pkg;

const RedStarQueueSchema = Schema ({
    author: String,
    Corp:{ type: Schema.Types.ObjectId, ref: "Corp" },
    timeOpened : { type: Date },
    length: Number,
    timeToTimeout : {type: Date},
    rsLevel: Number,
    registeredPlayers:{
        type: Map,
        of: String
    },
    extraPlayers:{
        type: Map,
        of: String
    },
    recruitMessage: String,
    currentStatusMessages: [{type: String}],
    recruitChannel: String,
    text: String
})

export const RedStarQueue = model("RedStarQueue", RedStarQueueSchema, "RedStarQueue")