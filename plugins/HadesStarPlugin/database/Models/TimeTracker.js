import pkg from 'mongoose';
const {Schema, model} = pkg;

const TimeTrackerSchema = Schema ({
    title: String,
    time: Date
})

export const TimeTracker = model("TimeTracker", TimeTrackerSchema, "TimeTracker")