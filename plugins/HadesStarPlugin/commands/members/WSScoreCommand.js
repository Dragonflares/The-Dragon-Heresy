import { MemberCommand } from './MemberCommand';
import { Member, Tech, Corp } from '../../database';
import { MessageEmbed } from 'discord.js';
import { TechTree } from '../../techs';
import { confirmResultButtons } from '../../utils';

export class WSScoreCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'wsscore',
            aliases: ['wsc'],
            description: "Shows the ws score of a certain player in your corp.",
            usage: "&wsscore (player)"
        });
    }

    async run(message, args) {
        let dMember = message.author;
        let dTarget = message.mentions.users.first() || message.author;
        let target;
        let member = await Member.findOne({ discordId: dMember.id.toString() }).populate("Corp").exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")

        if (!message.mentions.users.first()) {
            if (args[0]) {
                const techorMemberName = args.join('');
                let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
                let memberslist = new Map(corp.members.map(t => [t.name, t]))
                let playername = await confirmResultButtons(message, args.join(' '), [...memberslist.keys()])
                if (!playername) return;
                
                if (member.Corp.corpId != message.guild.id.toString())
                    return message.channel.send("You can't see a Member tech outside of your Corporation!");

                target = await Member.findOne({ name: playername }).populate("Corp").populate('techs').exec();
            } else {
                target = await Member.findOne({ discordId: dMember.id.toString() }).populate("Corp").populate('techs').exec();
            }
        } else {
            if (member.Corp.corpId != message.guild.id.toString())
                return message.channel.send("You can't see a Member tech outside of your Corporation!");

            target = await Member.findOne({ discordId: dTarget.id.toString() }).populate("Corp").populate('techs').exec();
        }

        if (!target)
            return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!");
        return await this.displayAll(message, target);
    }

    displayAll = async (message, member) => {
        let embed = new MessageEmbed().setColor("RANDOM");
        embed.setTitle(`**Player: ${member.name} **`);

        const memberTechsArray = member.techs.filter(t => t.level > 0).sort((a, b) => a.name > b.name ? 1 : -1);

        if (memberTechsArray.length) {
            const memberTechs = new Map(memberTechsArray.map(t => [t.name, t]));
            let totalScore = 0
            const temp = [...TechTree.categories.values()]
                .filter(category => memberTechsArray.some(t => category.has(t.name)))
                .sort((a, b) => a.name > b.name ? 1 : -1)
                .map(category => [
                    `*${category.name}*`,
                    Array.from(category.get().values())
                        .filter(t => memberTechs.has(t.name))
                        .map(t => {
                            let wsscore = TechTree.find(t.name).properties.get('WS Score')[memberTechs.get(t.name).level - 1];
                            totalScore += parseInt(wsscore);
                            return `${t.name} ${memberTechs.get(t.name).level} __Score__: ${wsscore}`
                        })
                ])
                .forEach(categoryData => embed.addField(categoryData[0], categoryData[1]));
            embed.addField("__**TOTAL:**__", totalScore)
        }
        else embed.setDescription("No techs were found!");

        return message.channel.send(embed);
    }
}