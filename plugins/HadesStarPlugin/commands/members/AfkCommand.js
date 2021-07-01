import { MemberCommand } from './MemberCommand';
import { Member, Tech } from '../../database';
import Mongoose from 'mongoose';
import { id } from 'common-tags';

export class AfkCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'awayfromkeyboard',
            aliases: ['afk'],
            description: "Sets you as afk.Use time as 1d20h3m4s as example, no spaces. Do &afk back when back (or &afk 0)",
            usage: "&afk <time>(no blank spaces) <details>"
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
        else return message.channel.send("You cannot set another Member's tech!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        let time = 0
        if (member.timezone == "+0") return message.channel.send(`Please Set TimeZone`);
        if (!args.length == 0 && args[0] != "back" && args[0] != "0") {
            time = calculateInMiliSeconds(args[0])
            if (time == "Nope") {
                return message.channel.send("Wrong Time Format");
            } else {
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

                //Save
                let timeatm = new Date()
                let awayTime = new Date(timeatm.getTime() + time);
                if (awayTime.toString() == "Invalid Date") {
                    return message.channel.send(`Too long or invalid time.`)
                } else if (diffDays > 30) {
                    return message.channel.send(`Too long away time, contact an officer.`)
                }
                member.awayTime = awayTime;
                member.awayDesc = reason;
                await member.save();

                //Send Message
                return message.channel.send(`You away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes \
                    \nFrom ${timeNow.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} to ${timeThen.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}.\
                    \nReason: ${reason}`);

            }
        } else {
            let awayTime = new Date();
            if (args.length == 0) {
                if (awayTime.getTime() < member.awayTime.getTime()) {
                    let time = member.awayTime.getTime() - awayTime.getTime()
                    var diffDays = Math.floor(time / 86400000); // days
                    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
                    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
                    return message.channel.send(`You still away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes in player TimeZone`)
                } else {
                    return message.channel.send("You are not away!")
                }
            } else {

                member.awayTime = awayTime;
                await member.save();
                return message.channel.send("Welcome Back!")
            }


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
