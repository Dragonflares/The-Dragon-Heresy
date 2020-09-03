import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmTech } from '../../utils';
import { Member } from '../../database';
import { MessageEmbed } from 'discord.js';

export class TechDataCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'techdata',
            aliases: ['td'],
            description: "Returns info about a certain tech in a certain level.",
            usage: "&techdata (tech) (level). Not stating any tech will show all existing techs, stating a tech will show it's description and max level. Stating a level will give detailed info on it"
        });
    }

    async run(message, args){
        let embed = new MessageEmbed().setColor("RANDOM")

        if(!args.length) {
            embed.setTitle(`**Known Techs**`);

            TechTree.categories.forEach((category, catId) => {
                embed.addField(`*${category.name}*`, `${[...category.get().values()].map(t => t.name).join(', ')}`)
            });

            return message.channel.send(embed)
        }
        else {

            const techName = args[0];
            const tech = TechTree.find(techName);

            if(!await confirmTech(message, techName, tech))
                return;
            
            if(!args[1]) {
                embed.setTitle(`**Tech: ${tech.name}**`)
                embed.setDescription(`${tech.description}\n`)
                embed.setFooter(`You may add a number between 1 and ${tech.levels} to get info about the required level`)
                embed.setThumbnail(`${tech.image}`)
                return message.channel.send(embed)
            }
            else {
                const level = args[1];
                if(1 > level || tech.levels < level)
                    return message.channel.send(`The level you requested is invalid for that tech!`)

                embed.setTitle(`**${tech.name}**`);
                embed.addField('*Category*', tech.category);
                embed.addField('*Description*', tech.description);
                embed.setThumbnail(tech.image);

                tech.properties.forEach((levels, propery) => {
                    embed.addField(`*${propery}*`, `${levels[args[1] - 1]}`)
                });
                return message.channel.send(embed)
            }
        }
    }
}