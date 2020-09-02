import { MemberCommand } from './MemberCommand';
import TechData from '../../../../assets/techs.json';
import { commandError } from '../../../../lib/utils';
import { TechTree } from '../../techs';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';
import { Embeds } from 'discord-paginationembed';

export class InteractiveUpdateTechCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'interactivetech',
            aliases: ['iptech'],
            description: "Allows you to update and check your techs.",
            usage: "&interactivetech (player)"
        });
    }

    async run(message, args){
        let targetb
        let mentionedUser = message.mentions.users.first()
        if(mentionedUser)
            return message.channel.send("You cannot set someone else's techs.");

        let member = await Member.findOne({discordId: message.author.id.toString()}).populate("Corp").exec();

        if(!member) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.");

        if(member.Corp.corpId != message.guild.id.toString())
            return message.channel.send("You aren't a Member of this Corporation!");

        return await this.techInformation(message, member);
    }

    techInformation = async (message, member) => {
        const embeds = await Promise.all(Array.from(TechTree.get().values()).map(async (tech) => {
            let memberTech = await Tech.findOne({name: tech.name, playerId: member.discordId});
            let embed = new MessageEmbed().setColor("RANDOM")
                embed.setTitle(tech.name);
                embed.setThumbnail(tech.image);

            embed.addField("Level", `${memberTech.level}\n`);
            return embed;
        }));

        const embed = new Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setDisabledNavigationEmojis(['delete'])
            .addFunctionEmoji('🔼', this.updateTech(message, member, +1))
            .addFunctionEmoji('🔽', this.updateTech(message, member, -1));
        return await embed.build();
    }

    updateTech(message, member, qty){
        return async (_, instance) => {
            try{
                let embed        = instance.array[instance.page-1]   
                const memberTech = await Tech.findOne({name: embed.title, playerId: member.discordId});
                
                const newLevel = parseInt(memberTech.level) + qty;

                if(newLevel < 1 || newLevel > TechTree.get(embed.title).levels)
                    return message.channel.send(`The level you gave is invalid for that tech!`);
                
                memberTech.level = newLevel;
                memberTech.save();
                instance.array[instance.page-1].fields[0].value = newLevel;
            }
            catch(e){
                commandError(message, e);
            }
        }
    }
}