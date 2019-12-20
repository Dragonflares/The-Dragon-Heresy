const {Schema, model} = require('mongoose')

const Corp = Schema ({
    corpId: String,
    name: String,
    level: Int32Array,
    members: [
    {
        type: Schema.Types.ObjectId, ref: 'Member'
    }
    ],
    battlegroups: [{type: Schema.Types.ObjectId, ref: 'Battlegroup'}]
})

module.exports = model("Corp", Corp)