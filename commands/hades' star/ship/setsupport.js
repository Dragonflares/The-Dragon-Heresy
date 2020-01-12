let TechData = require("../../../Database/Hades' Star/techs.json")
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
    name: "setsupport",
    aliases: ["setsp"],
    category: "hades' star",
    subcategory: "ship",
    description: "Sets which kind of support ship you are taking to the White Star.",
    usage: "&setsupport <supportcategory>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 0) return message.channel.send("You cannot set another player's support ship!")
        targetb = message.guild.member(message.author)
        let Member = MemberModel.findOne({discordId: targetb.id}).catch(err => console.log(err))
        if(!Member)
            return message.channel.send("You haven't joined a Corporation yet! Join one to get a profile!")
        MemberModel.findOne({discordId: targetb.id}).populate("Corp").exec((err, result) => {
            if(err) {
                console.log(err)
                return message.channel.send("There was an error while trying to obtain your profile")
            }
            else {
                if(result.Corp.corpId != message.guild.id.toString()) {
                    return message.channel.send("You aren't on your Corp's Discord server!")
                }
                else {
                    let messagesplit = message.content.split(" ")
                    if(messagesplit.length > 2)
                        return message.channel.send("Please specify a Support Ship Type, either Miner or Transport, and nothing else.")
                    else if(messagesplit[1].toLowerCase() === "miner") {
                        result.SupportShip = "Miner"
                        result.save()
                        return message.channel.send("You've successfully set a Miner as your White Star Support Ship")
                    }
                    else if(messagesplit[1].toLowerCase() === "transport") {
                        result.SupportShip = "Transport"
                        result.save()
                        return message.channel.send("You've successfully set a Transport as your White Star Support Ship")
                    }
                    else 
                        return message.channel.send("Please specify a Support Ship Type, either Miner or Transport")
                }
            }
        })
    }
}