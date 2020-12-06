import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmTech } from '../../utils';
import { Member } from '../../database';
import { MessageEmbed } from 'discord.js';

export class TechDataCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'techdata',
            aliases: ['td'],
            description: "Returns info about a certain tech in a certain level.",
            usage: "&techdata (tech) (level). Not stating any tech will show all existing techs, stating a tech will show it's description and max level. Stating a level will give detailed info on it"
        });
    }

    async run(message, args) {
        let embed = new MessageEmbed().setColor("RANDOM")

        if (!args.length) {
            embed.setTitle(`**Known Techs**`);

            TechTree.categories.forEach((category, catId) => {
                embed.addField(`*${category.name}*`, `${[...category.get().values()].map(t => t.name).join(', ')}`)
            });

            return message.channel.send(embed)
        }
        else {

            let level = parseInt(args[args.length - 1]);
            const techName = isNaN(level) ? args.join('') : args.slice(0, -1).join('');

            const tech = TechTree.find(techName);

            if (!await confirmTech(message, techName, tech))
                return;

            if (isNaN(level)) {
                embed.setTitle(`**Tech: ${tech.name}**`)
                embed.setDescription(`${tech.description}\n`)
                embed.setFooter(`You may add a number between 1 and ${tech.levels} to get info about the required level`)
                embed.setThumbnail(`${tech.image}`)
                return message.channel.send(embed)
            }

            if (1 > level || tech.levels < level)
                return message.channel.send(`The level you requested is invalid for that tech!`)

           /* embed.setTitle(`**${tech.name}**`);
            embed.addField('*Level*', level);
            embed.addField('*Category*', tech.category);
            embed.addField('*Description*', tech.description);
            embed.setThumbnail(tech.image);

            tech.properties.forEach((levels, propery) => {
                embed.addField(`*${propery}*`, `${levels[level - 1]}`)
            });
            console.log(level)*/

            //return message.channel.send(embed)

            let msgEmbed = await this.GetTechMessage(tech,level)

            const messageReaction = await message.channel.send(msgEmbed);
            if (level > 1) await messageReaction.react('◀️') //Send Initial Reaction
            if (level < tech.levels) await messageReaction.react('▶️') //Send Initial Reaction

            let reactionFilter = (reaction, user) => !user.bot
            let collector = messageReaction.createReactionCollector(reactionFilter, { dispose: true });
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name != '◀️' && reaction.emoji.name != '▶️') {
                reaction.remove() // Remove the Reaction
                }
                if (reaction.emoji.name == '◀️') {
                    level--;
                    let msgEmbed = await this.GetTechMessage(tech,level)
                    messageReaction.edit(msgEmbed)
                    messageReaction.reactions.removeAll()
                    if (level > 1) await messageReaction.react('◀️') //Send Initial Reaction
                    if (level < tech.levels) await messageReaction.react('▶️') //Send Initial Reaction
        
                } else if (reaction.emoji.name == '▶️') {
                    level++;
                    let msgEmbed = await this.GetTechMessage(tech,level)
                    messageReaction.edit(msgEmbed)
                    messageReaction.reactions.removeAll()
                    if (level > 1) await messageReaction.react('◀️') //Send Initial Reaction
                    if (level < tech.levels) await messageReaction.react('▶️') //Send Initial Reaction
        
                }
            });
        }
    }

    async GetTechMessage(tech, level) {
        let embed = new MessageEmbed().setColor("RANDOM")
        embed.setTitle(`**${tech.name}**`);
        embed.addField('*Level*', level);
        embed.addField('*Category*', tech.category);
        embed.addField('*Description*', tech.description);
        embed.setThumbnail(tech.image);

        tech.properties.forEach((levels, propery) => {
            embed.addField(`*${propery}*`, `${levels[level - 1]}`)
        });
        return embed;
    }
}