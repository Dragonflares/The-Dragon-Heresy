const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const Corp = Schema ({
    corpId: Number,
    name: String,
    level:{ 
        type: Number,
        default: 1
    },
    members: [{
        type: Mongoose.Types.ObjectId, ref: "Member"
    }],
    battlegroups: [{type: Mongoose.Types.ObjectId, ref: "Battlegroup"}]
})

module.exports = model("Corp", Corp, "Corp")