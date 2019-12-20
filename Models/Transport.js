const {Schema, model} = require('mongoose')

const Transport = Schema ({
    name: String,
    level: Int32Array,
    support: {type: Schema.Types.ObjectId, ref: 'Tech'},
    economy: [
        {type: Schema.Types.ObjectId, ref: 'Tech'}
    ]
})

module.exports = model("Transport", Transport)