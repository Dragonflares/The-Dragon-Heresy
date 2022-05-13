import { Manager } from '../../../lib';
import { Member, WhiteStar, Reminder } from '../database';


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
        let reminders = await Reminder.find().populate("author").exec();
        reminders.forEach(async r => {
            let awayTime = new Date();
            if (awayTime.getTime() > r.time.getTime()) {
                this.client.users.fetch(r.author.discordId, false).then((user) => {
                    user.send(`Reminder: ${r.what}`);
                });
                r.remove();
            }
        });
    }
    

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}
