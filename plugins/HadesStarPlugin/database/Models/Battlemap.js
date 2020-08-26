import {Schema, model} from 'mongoose';

const BattlemapSchema = Schema ({
    waypoints: [{
        type: Schema.Types.ObjectId, ref: 'Coordinate'
    }]
    
})

export const Battlemap = model("Battlemap", BattlemapSchema, "Battlemap")