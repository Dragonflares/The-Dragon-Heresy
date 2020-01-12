const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')


const Corp = Schema ({
    corpId: String,
    name: String,
    corpBattleshipLevel: {
        type: Number,
        default: 0
    },
    level:{ 
        type: Number,
        default: 1
    },
    battlegroups: [{type: Mongoose.Types.ObjectId, ref: "Battlegroup"}],
    members: [{type: Mongoose.Types.ObjectId, ref: "Member"}]
})

module.exports = model("Corp", Corp, "Corp")