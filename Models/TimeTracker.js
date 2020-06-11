const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')

const TimeTracker = Schema ({
    title: String,
    time: Date
})

module.exports = model("TimeTracker", TimeTracker, "TimeTracker")