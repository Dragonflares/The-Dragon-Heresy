import {Schema, model} from 'mongoose';
import { Member } from './Member';

const ReminderSchema = Schema ({
    author: { type: Schema.Types.ObjectId, ref: "Member" },
    time: Date,
    what: String,
   
})

export const Reminder = model("Reminder", ReminderSchema, "Reminder")