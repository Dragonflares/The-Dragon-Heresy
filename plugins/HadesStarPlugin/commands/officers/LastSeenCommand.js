import { OfficerCommand } from './OfficerCommand';
import { Member, Corp } from '../../database';
import { confirmResultButtons } from '../../utils';
import * as timeUtils from '../../utils/timeUtils.js'

export class LastSeenCommand extends OfficerCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'lastseen',
            aliases: ['ls'],
            description: "Shows you the last time a server member was seen.",
            usage: "ls (member/s)"
        });
    }

    async run(message, args) {
        let author = (await Member.findOne({ discordId: message.author.id.toString() }).catch(err => console.log(err)))
        if (!author) {
            return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
        }
        else {
            let carrier = await Member.findOne({ discordId: message.author.id.toString() }).populate("Corp").exec();
            if (carrier.Corp.corpId != message.guild.id.toString()) {
                return message.channel.send("You aren't a Member of this Corporation!")
            }
        }
        if (!args[0]) {
            if (message.mentions.users.size < 1) {
                let memberCount = 0
                let membersToBeCalled = []
                const members = await message.guild.members.fetch();
                members.forEach(element => {
                    Member.findOne({ discordId: element.id.toString() }).populate("Corp").exec((err, obtainedMember) => {
                        if (!obtainedMember) { }
                        else if (obtainedMember.Corp.corpId != element.guild.id.toString()) { }
                        else {
                            membersToBeCalled.push(obtainedMember)
                        }
                        memberCount++

                        if (memberCount === members.size) {
                            if (membersToBeCalled.length != 0) {
                                return this.TeamTimeZoneSituation(membersToBeCalled, message)
                            }
                        }
                    })
                })
            }
            else {
                let timer = 0
                let memberCount = 0
                let membersToBeCalled = []
                await message.mentions.users.forEach(element => {
                    Member.findOne({ discordId: element.id.toString() }).populate("Corp").exec((err, obtainedMember) => {
                        if (!obtainedMember) {
                            message.channel.send(element.name + "isn't part of any Corp.")
                        }
                        else if (obtainedMember.Corp.corpId != message.guild.id.toString()) {
                            message.channel.send(element.name + "isn't part of your Corp.")
                        }
                        else {
                            membersToBeCalled.push(obtainedMember)
                        }

                        memberCount++
                        if (memberCount === message.mentions.users.size) {
                            if (membersToBeCalled.length != 0) {
                                return this.TeamTimeZoneSituation(membersToBeCalled, message)
                            }
                        }
                    })
                })

            }
        }
        else {
            let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
            let memberslist = new Map(corp.members.map(t => [t.name, t]))
            let member = await confirmResultButtons(message,args.join(' '), [...memberslist.keys()])
            if (!member) return;
            return this.TeamTimeZoneSituation([memberslist.get(member)], message)
        }
    }

    async TeamTimeZoneSituation(membersToBeCalled, message) {
        let response = `\`\`\``
        await membersToBeCalled.forEach(element => {
            let messageConcat = ''
            if (element.online) {
                messageConcat = `- ${element.name} is online. \n`
            }
            else {
                let today = new Date()
                let {diffDays, diffHrs, diffMins } = timeUtils.timeDiff(today, element.lastSeen);
                messageConcat = `- ${element.name} was last seen ${diffDays} days, ${diffHrs} hours and ${diffMins} minutes ago. \n`
            }
            if (response.length + messageConcat.length + 3 >= 2000) {
                response += `\`\`\``
                message.channel.send(response)
                response = `\`\`\``
            }
            response += messageConcat
        })
        response += `\`\`\``
        return message.channel.send(response)
    }
}