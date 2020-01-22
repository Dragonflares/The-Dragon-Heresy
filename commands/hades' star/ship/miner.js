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
    name: "playerminer",
    aliases: ["getm"],
    category: "hades' star",
    subcategory: "ship",
    description: "Shows the current white star miner a player has.",
    usage: "&playerminer (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
        let requester = message.guild.member(message.author)
        let error = false

        let author = MemberModel.findOne({discordId: requester.id.toString()}).catch(err => console.log(err))
        if(!author) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        else {
            MemberModel.findOne({discordId: requester.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    error = true
                    console.log(err)
                    return message.channel.send("There was an issue requesting your profile.")
                }
                else if(authored.Corp.corpId != message.guild.id){
                    error = true
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        if(error) return
        let member = MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Miner set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Miner set")
        }
        else {
            MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString())
                        if(!userb)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Miner from isn't from this Corporation.")
                    MinerModel.findOne({_id: Obtained.miner}, (err, Miner) => {
                        if(!Miner) {
                            if(!userb)
                                return message.channel.send("You haven't set a Miner yet!")
                            else
                                return message.channel.send("This Member hasn't set a Miner yet!")
                        }
                        else {
                            createMinerProfile(Miner, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }
}

async function createMinerProfile(Miner, message) {
    MinerModel.findById(Miner._id).populate("mining")
        .populate("support")
        .exec((err, obtainedMiner) => {
            if(err) {
                message.channel.send("There was an error obtaining this Miner from the database")
                return console.log(err)
            }
            else {
                let minerEmbed = new RichEmbed().setColor("PURPLE")
                minerEmbed.setTitle(`**${obtainedMiner.name}**`)
                minerEmbed.addField("Level", `${obtainedMiner.level}`)
                let mining = ""
                obtainedMiner.mining.forEach(mine => {
                    mining += `${mine.name} ${mine.level}\n`
                })
                minerEmbed.addField("Mining", `${mining}`)
                if(obtainedMiner.level > 2)
                    minerEmbed.addField("Support", `${obtainedMiner.support.name} ${obtainedMiner.support.level}`)
                return message.channel.send(minerEmbed)
            }
        })
}