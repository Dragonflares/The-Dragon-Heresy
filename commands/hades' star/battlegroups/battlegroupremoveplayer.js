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
    name: "battlegroupremovemember",
    aliases: ["bgrem"],
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Removes a player from a white star battlegroup.",
    usage: "&battlegroupremovemember <battlegroupname> <member>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must specify who you are kicking!.")
        else targetb = message.guild.member(user)

        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || (messagesplit[1].indexOf("<@") > -1)) return message.channel.send("You must specify a battlegroup name!")

        let officer
        let error = false
        let author = (await MemberModel.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! You'll have to join one to be able to interact with Battlegroups.")
        }
        else {
            await MemberModel.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    error = true
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    error = true
                    return message.channel.send("You cannot remove a Member of a White Star Battlegroup of a Corporation you don't belong to!")
                }
                else {
                    if(authored.rank === "Officer" || authored.rank === "First Officer") {
                        officer = authored
                    }
                    else {
                        error = true
                        return message.channel.send("You must be at least an Officer to remove a Member of a Battlegroup!")
                    }
                }
            })
        }
        if(error) return
        let BattlegroupMember

        let member = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet!")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet!")
        }
        else {
            await MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString()) {
                        if(!user)
                            return message.channel.send("You cannot remove yourself from a battlegroup of a different Corporation than your own!")
                        else
                            return message.channel.send("This Member isn't part of your Corporation.")
                    }
                    else {
                        BattlegroupMember = Obtained
                        Obtained.battlegroupRank = ""
                        Obtained.save()
                        return removeBattlegroupMember(message, BattlegroupMember)
                    }
                }
            })
        }
    }
}

async function removeBattlegroupMember(message, BattlegroupMember) {
    let messagesplit = message.content.split(" ")
    battlegroupName = messagesplit[1]
    BattlegroupModel.findOne({
        Corp: message.guild.id.toString(), name: battlegroupName
    }, (err, ObtainedBG) => {
        if(!ObtainedBG) {
            return message.channel.send("There's no battlegroup with said name in this Corporation!")
        }
        else {
            let newMembers = ObtainedBG.members.filter(member => member.toString() != BattlegroupMember._id)
            ObtainedBG.members = newMembers
            ObtainedBG.save()
            return message.channel.send("I've succesfully removed this member from the Battlegroup")
        }
    }).catch(err => console.log(err))

}