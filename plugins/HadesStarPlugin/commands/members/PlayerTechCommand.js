import { Command } from '../../../../lib';
import TechData from '../../../../assets/techs.json';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';

export class PlayerTechCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'playertech',
            aliases: ['ptech'],
            description: "Shows the techs of a certain player in your corp.",
            usage: "&playertech (player)"
        });
    }

    async run(message, args){
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
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
        let CorpMember
        let CorpMember2 = (await Member.findOne({discordId: targetb.id.toString()}).catch(err => console.logg(err)))
        if(!CorpMember2){
            if(!userb){
                return message.channel.send("You were never part of a Corporation! You must join one to have a tech tracker!")
            }
            else {
                return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!")
            }
        } 
        else {
            await Member.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, result) => {
                if(err) return console.log(err)
                else {
                    if(result.Corp.corpId != message.guild.id.toString()) {
                        if(!userb)
                            return message.channel.send("You aren't in your home server")
                        else
                            return message.channel.send("You aren't in the home server of this Member")
                    }
                    else {
                         
                        return this.techInformation(message, result)
                    }
                }
            })
        }
    }

    async techInformation(message, CorpMember) {
        const messagesplit = message.content.split(" ")

            let embed = new MessageEmbed().setColor("RANDOM")
            embed.setTitle(`**Player: ${CorpMember.name} **`)
            if((!message.mentions.users.first() && !messagesplit[1]) || (message.mentions.users.first() && !messagesplit[2])){
                let economytechs = ""
                let weapontechs = ""
                let miningtechs = ""
                let shieldtechs = ""
                let supporttechs = ""
                let foundweapontech= 0 
                let foundeconomytech= 0 
                let foundminingtech= 0 
                let foundshieldtech = 0
                let foundsupporttech = 0
                for(let techname1 in TechData){ 
                    if(TechData[techname1].Category === "Economy") {
                        let tech = await Tech.findOne({name: techname1, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            economytechs += `${tech.name} ${tech.level}.\n`
                            foundeconomytech = 1
                        }
                    }
                    if(TechData[techname1].Category === "Mining") {
                        let tech = await Tech.findOne({name: techname1, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            miningtechs += `${tech.name} ${tech.level}.\n`
                            foundminingtech = 1
                        }
                    }
                    if(TechData[techname1].Category === "Weapons") {
                        let tech = await Tech.findOne({name: techname1, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            weapontechs += `${tech.name} ${tech.level}.\n`
                            foundweapontech = 1
                        }
                    }
                    if(TechData[techname1].Category === "Shields") {
                        let tech = await Tech.findOne({name: techname1, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            shieldtechs += `${tech.name} ${tech.level}.\n`
                            foundshieldtech = 1
                        }
                    }
                    if(TechData[techname1].Category === "Support") {
                        let tech = await Tech.findOne({name: techname1, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            supporttechs += `${tech.name} ${tech.level}.\n`
                            foundsupporttech = 1
                        }
                    }
                }
                
                if(foundeconomytech) embed.addField("*Economy*", `${economytechs}`)
                if(foundminingtech) embed.addField("*Mining*", `${miningtechs}`)
                if(foundweapontech) embed.addField("*Weapons*", `${weapontechs}`)
                if(foundshieldtech) embed.addField("*Shields*", `${shieldtechs}`)
                if(foundsupporttech) embed.addField("*Support*", `${supporttechs}`)

                if(foundeconomytech == 0 && foundminingtech == 0 && foundweapontech == 0 && foundshieldtech == 0 && foundsupporttech == 0){
                    embed.setDescription("No techs were found!")
                }
            }
            else if(!message.mentions.users.first()) {
                let foundtech = 0
                let techs = ""
                let category
                for(let techname in TechData){ 
                    if(TechData[techname].Category.toLowerCase() === messagesplit[1].toLowerCase()) {
                        let tech = await Tech.findOne({name: techname, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            techs += `${tech.name} ${tech.level}.\n`
                            foundtech = 1
                            category = tech.category
                        }
                    }
                }
                if(!foundtech) embed.setDescription("No techs were found!")
                else {
                    embed.addField(`*${category}*`, `${techs}`)
                }
            }
            else {
                let foundtech = 0
                let techs = ""
                let category
                for(let techname in TechData){ 
                    if(TechData[techname].Category.toLowerCase() === messagesplit[2].toLowerCase()) {
                        let tech = await Tech.findOne({name: techname, playerId: CorpMember.discordId})
                        if(tech.level > 0) {
                            techs += `${tech.name} ${tech.level}.\n`
                            foundtech = 1
                            category = tech.category
                        }
                    }
                }
                if(!foundtech) embed.setDescription("No techs were found!")
                else {
                    embed.addField(`*${category}*`, `${techs}`)
                }
            }
            return message.channel.send(embed)
    }
}