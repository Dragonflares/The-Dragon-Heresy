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
    name: "battlegroupcreate",
    aliases: ["bgcreate"],
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Creates a white star battlegroup and assigns it a captain.",
    usage: "&battlegroupcreate <name> <captain>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must assign a captain to this battlegroup!")
        else targetb = message.guild.member(user)


        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || (messagesplit[1].indexOf("<@") > -1)) return message.channel.send("You must specify a battlegroup name!")

        let officer

        let author = (await MemberModel.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
        }
        else {
            await MemberModel.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    if(!user) {}
                    else {
                        return message.channel.send("You cannot add a Member to a White Star Battlegroup of a Corporation you don't belong to!")
                    }
                }
                else {
                    officer = authored
                }
            })
        }
        let BattlegroupMember

        let member = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join yours to be added to a White Star Battlegroup.")
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
                            return message.channel.send("You cannot join a battlegroup of a different Corporation than your own!")
                        else
                            return message.channel.send("This Member isn't part of your Corporation.")
                    }
                    else if(!Obtained.battlegroupRank) {
                        BattlegroupMember = Obtained
                        return createBattlegroup(BattlegroupMember, message, client) 
                    }
                    else {
                        return message.channel.send("This Member is already part of another Battlegroup!")
                    }
                }
            })
        }
    }
}

async function createBattlegroup(BattlegroupMember, message, client) {
    let messagesplit = message.content.split(" ")
    BattlegroupModel.findOne({Corp: message.guild.id.toString(), name: messagesplit[1]}, (err, result) => {
        if(err) {
            message.channel.send("An unexpected error ocurred, please contact my creator.")
            return console.log(err)
        }
        else if(!result) {
            let NewBattlegroup = new BattlegroupModel({
                _id: new Mongoose.Types.ObjectId(),
                Corp: message.guild.id.toString(),
                name: messagesplit[1],
                captain: BattlegroupMember,
                members: []
            })
            NewBattlegroup.members.push(BattlegroupMember)
            NewBattlegroup.save()
            GuildModel.findOne({corpId: message.guild.id.toString()}, (err, Corp) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(!Corp) {
                    return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
                }
                else {
                    Corp.battlegroups.push(NewBattlegroup)
                    Corp.save()
                }
            })
        }
        else {
            return message.channel.send("There's already a Battlegroup with that name in this Corporation!")
        }
    })

    return message.channel.send("Battlegroup set!")
    
}
