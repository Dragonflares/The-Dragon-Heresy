const {Schema, model} = require('mongoose')

const Tech = Schema ({
    name: String,
    level: String,
    category: String,
<<<<<<< 5c9602f204adb29178889aec39bdc1adc3d9300d
    order: Int32Array
=======
    order: Number,
    playerId: String
>>>>>>> Bot version 1.0! Release to public
})

module.exports = model("Tech", Tech)