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
    name: "playerbattleship",
    aliases: ["getbs"],
    category: "hades' star",
    subcategory: "ship",
    description: "Shows the current white star battleship a player has.",
    usage: "&playerbattleship (player)",
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
                else if(authored.Corp.corpId != message.guild.id.toString()){
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        let member = MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Battleship set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Battleship set")
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
                            return message.channel.send("The Member you attempted to request a Battleship from isn't from this Corporation.")
                    BattleshipModel.findOne({_id: Obtained.battleship}, (err, Battleship) => {
                        if(!Battleship) {
                            if(!userb)
                                return message.channel.send("You haven't set a Battleship yet!")
                            else
                                return message.channel.send("This Member hasn't set a Battleship yet!")
                        }
                        else {
                            createBattleshipProfile(Battleship, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }
}

async function createBattleshipProfile(Battleship, message) {
    BattleshipModel.findOne({_id: Battleship._id}).populate("weapon").populate("shield").populate("support").exec((err, obtainedBattleship) => {
            if(err) {
                message.channel.send("There was an error obtaining this Battleship from the database")
                return console.log(err)
            }
            else {
                let battleshipEmbed = new RichEmbed().setColor("RED")
                battleshipEmbed.setTitle(`**${obtainedBattleship.name}**`)
                battleshipEmbed.addField("Level", `${obtainedBattleship.level}`)
                battleshipEmbed.addField("Weapon", `${obtainedBattleship.weapon.name} ${obtainedBattleship.weapon.level}`)
                battleshipEmbed.addField("Shield", `${obtainedBattleship.shield.name} ${obtainedBattleship.shield.level}`)
                if(obtainedBattleship.level > 1) {
                    let supports = ""
                    obtainedBattleship.support.forEach(support => {
                        supports += `${support.name} ${support.level}\n`
                    })
                    battleshipEmbed.addField("Support", `${supports}`)
                }
                return message.channel.send(battleshipEmbed)
            }
        })
}