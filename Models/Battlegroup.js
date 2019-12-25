const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Battlegroup = Schema ({
    Corp: Number,
    name: String,
    captain: {
        type: Mongoose.Types.ObjectId, ref: "Member"
    },
    members: [
        {
            type: Mongoose.Types.ObjectId, ref: "Member"
        }
    ]
})

module.exports = model("Battlegroup", Battlegroup, "Battlegroup")