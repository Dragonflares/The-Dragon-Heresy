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
    name: "playertransport",
    aliases: ["gettp"],
    category: "hades' star",
    subcategory: "ship",
    description: "Shows the current white star transport a player has.",
    usage: "&playertransport (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
        let requester = message.guild.member(message.author)


        let author = MemberModel.findOne({discordId: requester.id.toString()}).catch(err => console.log(err))
        if(!author) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        else {
            MemberModel.findOne({discordId: requester.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    console.log(err)
                    return message.channel.send("There was an issue requesting your profile.")
                }
                else if(authored.Corp.corpId != message.guild.id){
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        let member = MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Transport set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Transport set")
        }
        else {
            MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.channel.id.toString())
                        if(!userb)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Transport from isn't from this Corporation.")
                    TransportModel.findOne({_id: Obtained.transport}, (err, Transport) => {
                        if(!Transport) {
                            if(!userb)
                                return message.channel.send("You haven't set a Transport yet!")
                            else
                                return message.channel.send("This Member hasn't set a Transport yet!")
                        }
                        else {
                            createTransportProfile(Transport, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }
}

async function createTransportProfile(Transport, message) {
    TransportModel.findById(Transport._id).populate("mining")
        .populate("support")
        .exec((err, obtainedTransport) => {
            if(err) {
                message.channel.send("There was an error obtaining this Transport from the database")
                return console.log(err)
            }
            else {
                let transportEmbed = new RichEmbed().setColor("RED")
                transportEmbed.setTitle(`**${obtainedTransport.name}**`)
                transportEmbed.addField("Level", `${obtainedTransport.level}`)
                let economy = ""
                obtainedTransport.economy.forEach(mine => {
                    economy += `${mine.name} ${mine.level}\n`
                })
                transportEmbed.addField("Economy", `${economy}`)
                if(obtainedTransport.level > 2)
                    transportEmbed.addField("Support", `${obtainedTransport.support.name} ${obtainedTransport.support.level}`)
                return message.channel.send(transportEmbed)
            }
        })
}