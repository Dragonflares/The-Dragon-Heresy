const TechData = require("../../../techs.json")
let { RichEmbed } = require("discord.js")
const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')

module.exports = {
    name: "lastSeen",
    aliases: ["ls"],
    category: "hades' star",
    subcategory: "officers",
    description: "Shows you the last time a server member was seen.",
    usage: "ls (member/s)",
    run: async (client, message, args) => {
        let author = (await MemberModel.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
        }
        else {
            let Carrier = await MemberModel.findOne({discordId: message.author.id.toString()}).populate("Corp").exec()
            if(Carrier.Corp.corpId != message.guild.id.toString()){
                return message.channel.send("You aren't a Member of this Corporation!")
            }
        }
        if(message.mentions.users.size < 1) {
            let memberCount = 0
            let membersToBeCalled = []
            await message.guild.members.forEach(element => {
                MemberModel.findOne({discordId: element.id.toString()}).populate("Corp").exec( (err, obtainedMember) => {
                    if(!obtainedMember){}
                    else if(obtainedMember.Corp.corpId != element.guild.id.toString()) {}
                    else {
                        membersToBeCalled.push(obtainedMember)
                    }
                    memberCount++
                    if(memberCount === message.guild.members.size){
                        if(membersToBeCalled.length != 0){
                            return TeamTimeZoneSituation(membersToBeCalled, message)
                        }
                    }
                })
            })
        } 
        else {
            let timer = 0
            let memberCount = 0
            let membersToBeCalled = []
            await message.mentions.users.forEach(element => {
                MemberModel.findOne({discordId: element.id.toString()}).populate("Corp").exec( (err, obtainedMember) => {
                    if(!obtainedMember){
                        message.channel.send(element.name + "isn't part of any Corp.")
                    }
                    else if(obtainedMember.Corp.corpId != message.guild.id.toString()) {
                        message.channel.send(element.name + "isn't part of your Corp.")
                    }
                    else {
                        membersToBeCalled.push(obtainedMember)
                    }
                    memberCount++
                    if(memberCount === message.mentions.users.size){
                        if(membersToBeCalled.length != 0){
                            return TeamTimeZoneSituation(membersToBeCalled, message)
                        }
                    }
                })
            })
        }
    }
}

async function TeamTimeZoneSituation(membersToBeCalled, message) {
    let response = `\`\`\``
    await membersToBeCalled.forEach(element => {
        let messageConcat = ''
        if(element.online){
            messageConcat = `- ${element.name} is online. \n`
        }
        else {
            let today = new Date()
            let diffMs = today - element.lastSeen
            var diffDays = Math.floor(diffMs / 86400000); // days
            var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
            var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
            messageConcat = `- ${element.name} was last seen ${diffDays} days, ${diffHrs} hours and ${diffMins} minutes ago. \n`
        }
        if (response.length + messageConcat.length + 3 >= 2000){
            response += `\`\`\``
            message.channel.send(response)
            response = `\`\`\``
        } 
        response += messageConcat
    })
    response += `\`\`\``
    return message.channel.send(response)
}