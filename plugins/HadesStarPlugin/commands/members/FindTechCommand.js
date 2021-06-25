import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmResultButtons } from '../../utils';
import { Corp, Member, Tech } from '../../database';
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
            const level = parseInt(args[args.length - 1]);
            const techName = isNaN(level) ? args.join('') : args.slice(0, -1).join('');

            //const techName = args[0];
            //const tech = TechTree.find(techName);

            //if (!await confirmTech(message, techName, tech))
            //
            let techs = []
            for (const [key, value] of TechTree.technologies.entries()) {
                techs.push(value._name)
            }

            let techActualName = await confirmResultButtons(message, techName, techs)
            if (!techActualName) return;
            const tech = TechTree.find(techActualName);
                //return;

            let requester = message.guild.member(message.author)
            let error = false

            let member = await Member.findOne({ discordId: requester.id.toString() }).populate("Corp").exec()
            if (!member)
                return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")

            if (member.Corp.corpId != message.guild.id.toString())
                return message.channel.send("You aren't a Member of this Corporation!")

            if (!isNaN(level))
                return this.getFindTechInformation(message, tech, level)
            else
                return this.getFindTechInformation(message, tech, null)
        }
    }

    async getFindTechInformation(message, tech, limit) {
        let embed = new MessageEmbed().setColor("RANDOM")
        embed.setTitle(`**Tech: ${tech.name}**`);
        embed.setThumbnail(`${tech.image}`);

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();

        //find tech ID
        const members = Array.from(corp.members)

        let memListSorted = await Promise.all(
            //members.map(async t => [t, await Tech.findOne({ _id: Array.from(t.techs)[GetModuleID(tech.name)] }).exec()])
            members.map(async t => [t, await this.GetModule(t, tech.name)])
        )

        // console.log(memListSorted)
        memListSorted = memListSorted
            .filter(([key, value]) => value != null)
            .map(([key, value]) => [value.level, key.name])
            .filter(([key, value]) => key > 0)
            .filter(function ([key, value]) { if (limit) { return key == limit } else { return true } })
            .sort(([keya, valuea], [keyb, valueb]) => keya < keyb ? 1 : -1)
            .map(([key, value]) => `${value} ${key}`)
            .join('\n');

        if (memListSorted) embed.addField("*Players*", `${memListSorted}`)
        return message.channel.send(embed)
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