import { Command } from '../../../../lib';
import TechData from '../../../../assets/techs.json';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';

export class FindTechCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'findtech',
            aliases: ['ftech'],
            description: "Shows who owns the tech in the corp.",
            usage: "&findtech (player)"
        });
    }

    async run(message, args){
        const tech = message.content.split(" ")
           let embed = new MessageEmbed()
            .setColor("RANDOM")
        if(!tech[1]) {
            let economytechs = ""
            let weapontechs = ""
            let miningtechs = ""
            let shieldtechs = ""
            let supporttechs = ""

            embed.setTitle(`**Known Techs**`)

            for(let techname1 in TechData){ 
                if(TechData[techname1].Category === "Economy") {
                    economytechs += `${techname1}, `
                }
            }
            for(let techname2 in TechData) { 
                if(TechData[techname2].Category === "Mining") {
                    miningtechs += `${techname2}, `
                }
            }
            for(let techname3 in TechData) { 
                if(TechData[techname3].Category === "Weapons") {
                    weapontechs += `${techname3}, `
                }
            }
            for(let techname4 in TechData) { 
                if(TechData[techname4].Category === "Support") {
                    supporttechs += `${techname4}, `
                }
            }
            for(let techname5 in TechData) { 
                if(TechData[techname5].Category === "Shields") {
                        shieldtechs += `${techname5}, `
                }
            }

            embed.addField("*Economy*", `${economytechs}`)
            embed.addField("*Mining*", `${miningtechs}`)
            embed.addField("*Weapons*", `${weapontechs}`)
            embed.addField("*Shields*", `${shieldtechs}`)
            embed.addField("*Support*", `${supporttechs}`)

            return message.channel.send(embed)
        }
        else {
            if(!TechData[tech[1]]) return message.channel.send(`There's no tech with said name!`)
                
            
        
            let requester = message.guild.member(message.author)
            let error = false

            let author = (await Member.findOne({discordId: requester.id.toString()}).catch(err => console.log(err)))
            if(!author) 
                return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
            else {
                let Carrier = await Member.findOne({discordId: requester.id.toString()}).populate("Corp").exec()
                if(Carrier.Corp.corpId != message.guild.id.toString()){
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            }
            return this.getFindTechInformation(message, tech[1])
  
        }
    }

    async getFindTechInformation(message,module){
            let embed = new MessageEmbed().setColor("RANDOM")
            let techs = `${TechData[module].Description}\n`;
            embed.setTitle(`**Tech: ${module}**`)
            embed.setThumbnail(`${TechData[module].Image}`);
            let corpmembers = await message.guild.members.fetch();
            let playersWithTech = ""
            
            for (let [k, member] of corpmembers) {
                let corpMember  = await Member.findOne({discordId: member.id.toString()}).populate("Corp")
                if(corpMember)
                {
                    if(corpMember.Corp.corpId == message.guild.id.toString())
                    {
                        let techrequest = await Tech.findOne({name: module, playerId: member.id})  
                        if(techrequest)                             
                            if(techrequest.level >0)
                                playersWithTech +=  `${corpMember.name} ${techrequest.level}.\n`
                    }
                }
            }
            if(playersWithTech) embed.addField("*Players*", `${playersWithTech}`)
            return message.channel.send(embed)
    }
}