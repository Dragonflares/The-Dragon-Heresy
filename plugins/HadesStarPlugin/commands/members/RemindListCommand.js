import { MemberCommand } from './MemberCommand';
import { Member} from '../../database';
import * as timeUtils from '../../utils/timeUtils.js'

export class RemindListCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'remindlist',
            aliases: ['rmdlist', 'rmdl','rl','reminders'],
            description: "Lists your reminders",
            usage: "&remindlist"
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
        else return message.channel.send("You cannot see another people reminders!")

        let member = await Member.findOne({ discordId: target.id.toString()}).populate('reminders').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        let stringToSend="";

        if(member.reminders) {
            let memberReminders = Array.from(member.reminders);
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

            //Small fix for an oops of not deleting in manager
            if (memberReminders.length ==0){
                let member1 = await Member.findOne({ discordId: target.id.toString()}).exec();
                if(member1.reminders.length != memberReminders.length)
                {
                    member1.reminders = new Array()
                    await member1.save();
                }
            }
        }
        if (stringToSend == "") 
            stringToSend = "You have no reminders." 
        return message.channel.send(stringToSend)
    }
}
