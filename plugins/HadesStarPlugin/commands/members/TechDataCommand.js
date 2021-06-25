import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmResultButtons } from '../../utils';
import { Member } from '../../database';
import { MessageEmbed } from 'discord.js';

const { MessageButton, MessageActionRow } = require("discord-buttons")

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
            let techs = []
            for (const [key, value] of TechTree.technologies.entries()) {
                techs.push(value._name)
            }

            let techActualName = await confirmResultButtons(message, techName, techs)
            if (!techActualName) return;
            const tech = TechTree.find(techActualName);

            if (isNaN(level)) {
                embed.setTitle(`**Tech: ${tech.name}**`)
                embed.setDescription(`${tech.description}\n`)
                embed.setFooter(`You may add a number between 1 and ${tech.levels} to get info about the required level`)
                embed.setThumbnail(`${tech.image}`)
                return message.channel.send(embed)
            }

            if (1 > level || tech.levels < level)
                return message.channel.send(`The level you requested is invalid for that tech!`)


            let msgEmbed = await this.GetTechMessage(tech, level)




            let previousButton = new MessageButton()
                .setStyle('blurple')
                .setLabel('Previous')
                .setID('prev')

            let nextButton = new MessageButton()
                .setStyle('blurple')
                .setLabel('Next')
                .setID('next')
            let buttonRow = new MessageActionRow()

            if (level > 1) buttonRow.addComponent(previousButton)
            if (level < tech.levels) buttonRow.addComponent(nextButton)
            let messageReaction
            if (buttonRow.components.length > 0)
                messageReaction = await message.channel.send({ component: buttonRow, embed: msgEmbed });
            else
                messageReaction = await message.channel.send({ embed: msgEmbed });
            const filter = (button) => button.clicker.user.bot == false;
            const collector = messageReaction.createButtonCollector(filter, { time: 2 * 60 * 1000, dispose: true });
            collector.on('collect', async b => {
                if (b.id == "prev") level--;
                if (b.id == "next") level++;
                if (b.id == "prev" || b.id == "next") {
                    let msgEmbed = await this.GetTechMessage(tech, level)
                    let buttonRow = new MessageActionRow()
                    if (level > 1) buttonRow.addComponent(previousButton)
                    if (level < tech.levels) buttonRow.addComponent(nextButton)
                    messageReaction.edit({ component: buttonRow, embed: msgEmbed })
                }
                b.defer()
            });

            collector.on('end', async collected => {
                let msgEmbed = await this.GetTechMessage(tech, level)
                messageReaction.edit({ component: null, embed: msgEmbed });
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