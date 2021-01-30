import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Tech, Corp } from '../../database';
import { TechTree } from '../../techs';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
const Discord = require('discord.js');

export class SummaryWhiteStarCommand extends WhitestarsCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'summaryws',
            aliases: ['sumws'],
            description: "Summary of Whitestar Members",
            usage: "&summaryws <wsrole>"
        });
    }

    async run(message, args) {
        let user = message.guild.member(message.author)
        let roles = message.mentions.roles.first()
        let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            if (!roles) return message.channel.send("Please input a discord role for the WS!")
            if (member.Corp.corpId === message.guild.id.toString())
                return this.summaryMessage(message, roles, member)
            else
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    summaryMessage = async (message, role, member) => {
        message.delete({ timeout: 1 });    //Delete User message
        const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('members/techs').exec()

        //Create Message
        let summaryEmbed = new Discord.MessageEmbed()
            .setTitle(`Summary of whitestar members:`)
            .setThumbnail("https://i.imgur.com/fNtJDNz.png")
            .setDescription(`Top 5 Tech Levels`)
            .addField("Group:", `<@&${ws.wsrole}>`, true)

        await Promise.all(Array.from(TechTree.technologies.values()).map(async tech => {
            let members = ws.members
            let memListSorted = await Promise.all(
                members.map(async t => [t, await this.GetModule(t, tech.name)])
            )

            // console.log(memListSorted)
            memListSorted = memListSorted
                .filter(([key, value]) => value != null)
                .map(([key, value]) => [value.level, key.name])
                .filter(([key, value]) => key > 0)
                .sort(([keya, valuea], [keyb, valueb]) => keya < keyb ? 1 : -1)
                .map(([key, value]) => `${value} ${key}`)
                .slice(0, 5)
                .join('\n');

            if (memListSorted)
                summaryEmbed.addField(tech.name.replace(/([A-Z])/g, ' $1').trim(), memListSorted, true)
        }));
        return message.channel.send(summaryEmbed)
    }
    async GetModule(member, techName) {
        let techFound;
        let techs = await Tech.find({ _id: Array.from(member.techs) })

        techs.map(t => {
            if (t.name == techName) techFound = t;
        })
        return techFound
    }
}