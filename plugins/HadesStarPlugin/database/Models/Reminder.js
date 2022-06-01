import pkg from 'mongoose';
const {Schema, model} = pkg;

const ReminderSchema = Schema ({
    author: { type: Schema.Types.ObjectId, ref: "Member" },
    time: Date,
    what: String,
   
})

export const Reminder = model("Reminder", ReminderSchema, "Reminder")