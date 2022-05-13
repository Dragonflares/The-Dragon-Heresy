import { MemberCommand } from './MemberCommand';
import { Member, Corp, Reminder } from '../../database';

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
            target = message.guild.member(message.author)
        }
        else if (message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot see another people reminders!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').populate('reminders').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")


        let memberReminders = Array.from(member.reminders);

        let stringToSend="";
        let i =1
        memberReminders.map(async m => {
            let awayTime = new Date();
                if (awayTime.getTime() < m.time.getTime()) {
                    let time = m.time.getTime() - awayTime.getTime()
                    var diffDays = Math.floor(time / 86400000); // days
                    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
                    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
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


    }
}
