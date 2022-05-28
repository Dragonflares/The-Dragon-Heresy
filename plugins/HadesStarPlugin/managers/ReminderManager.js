import { Manager } from '../../../lib';
import { Member, Reminder } from '../database';


export class ReminderManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
          let interval;
          interval = setInterval(this.CheckReminders, 10 * 1000);
        }
        super.enable();
    }

    CheckReminders = async (client) => {
        await Reminder.find({"time":{"$lte": new Date()}}).populate("author").exec().then(async reminders => {
            reminders.forEach( async remind => {
                this.client.users.fetch(remind.author.discordId, false)
                    .then((user) => user.send(`Reminder: ${remind.what}`));
                await Member.findOneAndUpdate({discordId: remind.author.discordId.toString()}, {$pull: {reminders: remind._id} }).catch(err => console.log(err))
                remind.remove();
        })})
        .catch(err => console.log(err))
    }
    

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}
