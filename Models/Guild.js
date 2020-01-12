const {Schema, model} = require('mongoose')

const Corp = Schema ({
    corpId: String,
    name: String,
<<<<<<< 5c9602f204adb29178889aec39bdc1adc3d9300d
    level: Int32Array,
    members: [
    {
        type: Schema.Types.ObjectId, ref: 'Member'
    }
    ],
    battlegroups: [{type: Schema.Types.ObjectId, ref: 'Battlegroup'}]
=======
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
>>>>>>> Bot version 1.0! Release to public
})

module.exports = model("Corp", Corp)