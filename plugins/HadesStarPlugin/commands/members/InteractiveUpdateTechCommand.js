import { Command } from '../../../../lib';
import TechData from '../../../../assets/techs.json';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';
import { Embeds } from 'discord-paginationembed';

export class InteractiveUpdateTechCommand extends Command{
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
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set someone else's techs.")
        let requester = message.guild.member(message.author)


        let member = await Member.findOne({discordId: requester.id.toString()}).populate("Corp").exec();
        if(!member) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        if(member.Corp.corpId != message.guild.id.toString())
            return message.channel.send("You aren't a Member of this Corporation!")

        if(member.Corp.corpId != message.guild.id.toString()) {
            if(!userb)
                return message.channel.send("You aren't in your home server")
            else
                return message.channel.send("You aren't in the home server of this Member")
        }
        else {
            return this.techInformation(message, member);
        }
    }


    techInformation = async (message, CorpMember) => {
        const messagesplit = message.content.split(" ")

        let embeds = []
        
        for(let tech in TechData) {
            let Embed = new MessageEmbed().setColor("RANDOM")
            Embed.setTitle(`${tech}`)
            let tech2 = await Tech.findOne({name: tech, playerId: CorpMember.discordId})
            let techresult = `${tech2.level}\n`
            Embed.addField("Level", `${techresult}`)
            Embed.setThumbnail(`${TechData[tech].Image}`)
            embeds.push(Embed)
        }
        let iptech = new Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setDisabledNavigationEmojis(['DELETE'])
            .addFunctionEmoji('🔼', (_, instance) => {
                let currentEmbed = instance.array[instance.page-1]   
                let techname = currentEmbed.title
                Tech.findOne({name: techname, playerId: CorpMember.discordId},(err, tech) => {
                    if(err) {
                        message.channel.send("An unexpected error ocurred, please contact my creator.")
                        return console.log(err)
                    }
                    else {
                        if((tech.level + 1) > Number(TechData[tech.name].Level[TechData[tech.name].Level.length - 1])) {
                            message.channel.send(`The level you gave is invalid for that tech!`)
                        }
                        else {
                            tech.level++
                            tech.save()
                            instance.array[instance.page-1].fields[0].value = tech.level
                        }
                    }
                })
            })
            .addFunctionEmoji('🔽', (_, instance) => {
                let currentEmbed = instance.array[instance.page-1]
                let techname = currentEmbed.title 
                Tech.findOne({name: techname, playerId: CorpMember.discordId},(err, tech) => {
                    if(err) {
                        message.channel.send("An unexpected error ocurred, please contact my creator.")
                        return console.log(err)
                    }
                    else {
                        if((tech.level - 1) < 0) {
                            message.channel.send(`The level you gave is invalid for that tech!`)
                        }
                        else {
                            tech.level--
                            tech.save()
                            instance.array[instance.page-1].fields[0].value = tech.level
                        }
                    }
                })
            })
            .build()
    }
}