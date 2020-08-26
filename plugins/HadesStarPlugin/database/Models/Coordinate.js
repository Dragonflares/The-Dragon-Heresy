import {Schema, model} from 'mongoose';

const CoordinateSchema = Schema ({
    line: String,
    number: Number,
    type: String,
    player: {
        type: Schema.Types.ObjectId,
        ref: "Member",
        default: null
    },
    friendly: {
        type: Boolean,
        default: null
    }
})

export const Coordinate = model("Coordinate", CoordinateSchema, "Coordinate")