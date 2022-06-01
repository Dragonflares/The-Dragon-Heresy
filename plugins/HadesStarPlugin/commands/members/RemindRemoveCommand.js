import { MemberCommand } from './MemberCommand';
import { Member} from '../../database';
import * as timeUtils from '../../utils/timeUtils.js'

export class RemindRemoveCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'remindremove',
            aliases: ['rmdrm','remindrm','rr'],
            description: "Removes reminder",
            usage: "&remindremove index"
        });
    }

    async run(message, args) {
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.author
        }
        else if (message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot ssee another people reminders!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').populate('reminders').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")


        let memberReminders = Array.from(member.reminders);
        let stringToSend="";
        if(!args[0])
        {
            let i =1
            memberReminders.map(async m => {
                let awayTime = new Date();
                    if (awayTime.getTime() < m.time.getTime()) {
                        let {diffDays, diffHrs, diffMins } = timeUtils.timeDiff(m.time,awayTime);
                        if(diffDays>0)
                            stringToSend+= `${i}) **${m.what}** (${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes)\n`;
                        else if(diffMins>0)
                            stringToSend+= `${i}) **${m.what}** (${diffHrs} Hours and ${diffMins} Minutes)\n`;
                        else
                            stringToSend+= `${i}) **${m.what}** (${diffMins} Minutes)\n`;
                    }else{
                        stringToSend+= `${i}) already reminded to ${m.what}\n`;
                    }
                
                i++;
            });

            if (stringToSend == "") 
                stringToSend = "You have no reminders." 

            return message.channel.send(stringToSend)
            
        }else{
            if(args[0] == "all")
            {
                memberReminders.map(async m => {
                    m.remove();
                });
                member.reminders = [];
                member.save();
                return message.channel.send("All reminders removed.")
            }
            const index     = parseInt(args[0]);
            if (!isNaN(index)) {
                let reminderToRemove = memberReminders[index-1];
                if(reminderToRemove) {
                    let remainingReminder =  member.reminders.filter(m => m != reminderToRemove)
                    member.reminders = remainingReminder;
                    reminderToRemove.remove();
                    member.save();
                    return message.channel.send("Reminder removed.")
                } else{
                    return message.channel.send("There is no such reminder.")
                }
               
            }else{
                return message.channel.send("Wrong reminder index.")
            }
        }
    }
}
