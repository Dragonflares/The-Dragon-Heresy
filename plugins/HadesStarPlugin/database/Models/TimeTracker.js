import {Schema, model} from 'mongoose';

const TimeTrackerSchema = Schema ({
    title: String,
    time: Date
})

export const TimeTracker = model("TimeTracker", TimeTrackerSchema, "TimeTracker")