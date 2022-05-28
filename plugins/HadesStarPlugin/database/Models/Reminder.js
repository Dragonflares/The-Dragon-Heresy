import {Schema, model} from 'mongoose';

const ReminderSchema = Schema ({
    author: { type: Schema.Types.ObjectId, ref: "Member" },
    time: Date,
    what: String,
   
})

export const Reminder = model("Reminder", ReminderSchema, "Reminder")