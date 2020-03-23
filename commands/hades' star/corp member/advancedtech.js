let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
let Player = require("../../../player.js")
const TechModel = require("../../../Models/Techs")
const Pagination = require('discord-paginationembed');

module.exports = {
    name: "interactivetech",
    aliases: ["iptech"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows the techs of a certain player in your corp.",
    usage: "&interactivetech (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
        let requester = message.guild.member(message.author)


        let author = (await MemberModel.findOne({discordId: requester.id.toString()}).catch(err => console.log(err)))
        if(!author) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        else {
            await MemberModel.findOne({discordId: requester.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    console.log(err)
                    return message.channel.send("There was an issue requesting your profile.")
                }
                else if(authored.Corp.corpId != message.guild.id.toString()){
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        let CorpMember
        let CorpMember2 = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.logg(err)))
        if(!CorpMember2){
            if(!userb){
                return message.channel.send("You were never part of a Corporation! You must join one to have a tech tracker!")
            }
            else {
                return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!")
            }
        } 
        else {
            await MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, result) => {
                if(err) return console.log(err)
                else {
                    if(result.Corp.corpId != message.guild.id.toString()) {
                        if(!userb)
                            return message.channel.send("You aren't in your home server")
                        else
                            return message.channel.send("You aren't in the home server of this Member")
                    }
                    else {
                        CorpMember = result
                        return setTimeout(techInformation, 500, message, CorpMember)
                    }
                }
            })
        }
    }
}

async function techInformation(message, CorpMember) {
    const messagesplit = message.content.split(" ")

    let embeds = []
    
    for(let tech in TechData) {
        let Embed = new RichEmbed().setColor("RANDOM")
        Embed.setTitle(`${tech}`)
        let tech2 = await TechModel.findOne({name: tech, playerId: CorpMember.discordId})
        let techresult = `${tech2.level}\n`
        Embed.addField("Level", `${techresult}`)
        Embed.setThumbnail(`${TechData[tech].Image}`)
        embeds.push(Embed)
    }
    let iptech = new Pagination.Embeds()
        .setArray(embeds)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setDisabledNavigationEmojis(['DELETE'])
        .addFunctionEmoji('🔼', (_, instance) => {
            let currentEmbed = instance.array[instance.page-1]   
            let techname = currentEmbed.title
            TechModel.findOne({name: techname, playerId: CorpMember.discordId},(err, tech) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else {
                    tech.level++
                    tech.save()
                    instance.array[instance.page-1].fields[0].value = tech.level
                }
            })
        })
        .addFunctionEmoji('🔽', (_, instance) => {
            let currentEmbed = instance.array[instance.page-1]
            let techname = currentEmbed.title 
            TechModel.findOne({name: techname, playerId: CorpMember.discordId},(err, tech) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else {
                    tech.level--
                    tech.save()
                    instance.array[instance.page-1].fields[0].value = tech.level
                }
            })
        })
        .build()
}