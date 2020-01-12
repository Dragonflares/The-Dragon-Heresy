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
})

module.exports = model("Battlegroup", Battlegroup)