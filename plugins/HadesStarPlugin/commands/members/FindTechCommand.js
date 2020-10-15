import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmTech } from '../../utils';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';

export class FindTechCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'findtech',
            aliases: ['ftech'],
            description: "Shows who owns the tech in the corp.",
            usage: "&findtech (tech) <level>"
        });
    }

    async run(message, args) {
        let embed = new MessageEmbed().setColor("RANDOM")
        if (!args.length) {
            embed.setTitle(`**Known Techs**`)

            const categories = new Map();
            TechTree.technologies.forEach((tech, name) => {
                if (!categories.has(tech.category))
                    categories.set(tech.category, new Set());

                categories.get(tech.category).add(name);
            });

            categories.forEach((techs, name) => {
                embed.addField(`*${name}*`, `${Array.from(techs).join(', ')}`)
            });

            return message.channel.send(embed)
        }
        else {

            const techName = args[0];
            const tech = TechTree.find(techName);

            if (!await confirmTech(message, techName, tech))
                return;

            let requester = message.guild.member(message.author)
            let error = false

            let member = await Member.findOne({ discordId: requester.id.toString() }).populate("Corp").exec()
            if (!member)
                return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")

            if (member.Corp.corpId != message.guild.id.toString())
                return message.channel.send("You aren't a Member of this Corporation!")

            if (args[1])
                if(!isNaN(args[1]))
                    return this.getFindTechInformation(message, tech, args[1])
                else
                    return message.channel.send("The number is not valid")
            else
                return this.getFindTechInformation(message, tech, null)
        }
    }

    async getFindTechInformation(message, tech, limit) {
        let embed = new MessageEmbed().setColor("RANDOM")
        embed.setTitle(`**Tech: ${tech.name}**`);
        embed.setThumbnail(`${tech.image}`);

        let techList = await Tech.find({ name: tech.name.toString() }).exec();

        const techListSorted = techList
            .filter(function(t){return !(message.guild.members.cache.get(t.playerId) == null)})
            .filter(function(t){return !(message.guild.members.cache.get(t.playerId).displayName == null)})
            .filter(t => t.level > 0)
            .filter( function (t) { if(limit) {return t.level==limit} else {return true}} )
            .sort((a, b) => a.level < b.level ? 1 : -1)
            .map(t => `${message.guild.members.cache.get(t.playerId).displayName} ${t.level}`)
            .join('\n');

        if (techListSorted) embed.addField("*Players*", `${techListSorted}`)
        return message.channel.send(embed)
    }
}