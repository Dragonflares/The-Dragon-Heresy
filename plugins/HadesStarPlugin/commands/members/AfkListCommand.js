import { MemberCommand } from './MemberCommand';
import { Member, Corp } from '../../database';

export class AfkListCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'awayfromkeyboardlist',
            aliases: ['afklist', 'afkl'],
            description: "Lists whom is afk",
            usage: "&afklist"
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
        else return message.channel.send("You cannot set another Member's afk!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').exec();

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();

        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        if (member.Corp.corpId != message.guild.id.toString())
        return message.channel.send("This aint your corporation!.")
        //get array of members
        let membersInCorp = Array.from(corp.members)
        

        //Loop all channel members
        let stringToSend = ""
        membersInCorp.forEach( memberToCheck => {
            if (memberToCheck.awayTime) {
                let awayTime = new Date();
                if (awayTime.getTime() < memberToCheck.awayTime.getTime()) {
                    let time = memberToCheck.awayTime.getTime() - awayTime.getTime()
                    var diffDays = Math.floor(time / 86400000); // days
                    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
                    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes

                    if (memberToCheck.awayDesc == "") {
                        stringToSend += `- ${memberToCheck.name} is away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes \n`
                    }
                    else {
                        stringToSend += `- ${memberToCheck.name} is away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes, Reason: ${memberToCheck.awayDesc}\n`
                    }
                }
            }
        });
        if (stringToSend == "") stringToSend = "There are no afk people on this server."
        return message.channel.send("`\`\`" + stringToSend + "`\`\`" )
    }s
}
