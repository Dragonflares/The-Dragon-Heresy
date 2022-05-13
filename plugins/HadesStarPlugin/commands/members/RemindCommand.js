import { MemberCommand } from './MemberCommand';
import { Member, Tech, Reminder } from '../../database';
import Mongoose from 'mongoose';
import { id } from 'common-tags';

export class RemindCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'remind',
            aliases: ['rmd'],
            description: "Sets a reminder. Use time as 1d20h3m4s as example, no spaces.",
            usage: "&remind <time>(no blank spaces) <details>"
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
        else return message.channel.send("You cannot set another Member's reminder!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').populate('reminders').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        let time = 0

        if (!args.length == 0) {
            time = calculateInMiliSeconds(args[0])
            if(!args[1])
                return message.channel.send("Try again with what should i remind you?");
            if (time == "Nope") {
                return message.channel.send("Wrong Time Format");
            } else {
                if(member.reminders.length>=8)
                return message.channel.send("Too many reminders. (8 max)");
                var diffDays = Math.floor(time / 86400000); // days
                var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
                var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes

                //Calculte Current Time
                let timeNow = new Date()
                timeNow = new Date(timeNow.getTime() + timeNow.getTimezoneOffset() * 60 * 1000);
                timeNow = new Date(timeNow.getTime() + member.timezone * 60 * 60 * 1000);

                //Calculate Back Time
                let timeThen = new Date()
                timeThen = new Date(timeThen.getTime() + timeNow.getTimezoneOffset() * 60 * 1000);
                timeThen = new Date(timeThen.getTime() + time);
                timeThen = new Date(timeThen.getTime() + member.timezone * 60 * 60 * 1000);

                //Get Reason
                let reason = ""
                if (args[1]) reason = args.slice(1).join(' ')
                if(reason.toLowerCase().includes("http")){
                    return message.channel.send(`Adding links to reminder messages is disabled.`)
                }
                //Save
                let timeatm = new Date()
                let awayTime = new Date(timeatm.getTime() + time);
                if (awayTime.toString() == "Invalid Date") {
                    return message.channel.send(`Too long or invalid time.`)
                } else if (diffDays > 30) {
                    return message.channel.send(`Too long time, buy an alarm clock.`)
                }
                let newRemind = new Reminder({
                    _id: new Mongoose.Types.ObjectId(),
                    author: member,
                    time: awayTime,
                    what: reason
                  })
                  await newRemind.save();
                  member.reminders.push(newRemind);
                  await member.save();

                  //Send Message
                if (reason != "")
                    return message.channel.send(`You will be reminded in ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes to ${reason}`);

            }
        } else {
            return message.channel.send("Usage: &remind <time>(no blank spaces) <details>")
      
        }
    }


}
function calculateInMiliSeconds(timeStamp) {
    var timeInMiliSeconds = 0;
    if (timeStamp.match(/(\d+)?[d|h|m|s]/g)) {
        timeStamp.match(/(\d+)?[d|h|m|s]/g).forEach((match) => {
            let value = match.slice(0, -1)
            if (!Number.isInteger(value)) {
                if (match.indexOf("d") > -1) {
                    timeInMiliSeconds += value * 60 * 60 * 24;
                } else if (match.indexOf("h") > -1) {
                    timeInMiliSeconds += value * 60 * 60;
                } else if (match.indexOf("m") > -1) {
                    timeInMiliSeconds += value * 60;
                } else if (match.indexOf("s") > -1) {
                    timeInMiliSeconds += value * 1;
                }
            }
        });
        if (timeInMiliSeconds == 0) return "Nope"
        return timeInMiliSeconds * 1000;
    } else {
        return "Nope"
    }
}
