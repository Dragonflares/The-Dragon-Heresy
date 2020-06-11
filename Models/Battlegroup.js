const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Battlegroup = Schema ({
    Corp: String,
    name: String,
    captain: {
        type: Schema.Types.ObjectId, ref: 'Member'
    },
    members: [
    {
        type: Schema.Types.ObjectId, ref: 'Member'
    }
    ],
    Battlemap: {
        type: Schema.Types.ObjectId, ref: 'Battlemap'
    },
    textchannel: {
        type: String
    }
})

module.exports = model("Battlegroup", Battlegroup, "Battlegroup")