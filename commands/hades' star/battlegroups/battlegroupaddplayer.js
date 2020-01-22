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
    name: "battlegroupaddmember",
    aliases: ["bgadd"],
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Add's a player to a white star battlegroup.",
    usage: "&battlegroupaddmember <battlegroupname> <role> <member>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) targetb = message.guild.member(message.author)
        else targetb = message.guild.member(user)
        
        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || messagesplit[1].startsWith("<@")) return message.channel.send("You must specify a battlegroup name first!")

        let officer
        let error = false
        let author = (await MemberModel.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
        }
        else {
            await MemberModel.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    error = true
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    if(!user) {}
                    else {
                        error = true
                        return message.channel.send("You cannot add a Member to a White Star Battlegroup of a Corporation you don't belong to!")
                    }
                }
                else {
                    officer = authored
                }
            })
        }
        let BattlegroupMember
        if(error) return
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
                    else {
                        BattlegroupMember = Obtained
                        BattlegroupCheck(officer, BattlegroupMember, message, client)
                    }
                }
            })
        }
    }
}

async function BattlegroupCheck(officer, BattlegroupMember, message, client) {
    BattlegroupModel.findOne({
        Corp: message.guild.id.toString(), name: message.content.split(" ")[1]
    }, (err, ObtainedBG) => {
        if(!ObtainedBG) {
            return message.channel.send("There's no battlegroup with said name in this Corporation!")
        }
        else {
            if(officer.rank === "Officer" || officer.rank ==="First Officer") {
                addMemberToBattlegroup(BattlegroupMember, message, client, ObtainedBG)
            }  
            else return message.channel.send("You must be at least an Officer to add someone to a battlegroup!")
        }
    }).catch(err => console.log(err))
}

async function addMemberToBattlegroup(BattlegroupMember, message, client, Battlegroup) {
    let messagesplit = message.content.split(" ")
    if(!messagesplit[2] || messagesplit[2].startsWith("<@")) return message.channel.send("You must specify a role for this Member.")
    
    if(!Battlegroup.members.includes(BattlegroupMember._id)) {
        if(BattlegroupMember.battlegroupRank != "") {
            return message.channel.send("This person belongs to another Battlegroup already!")
        }
        await captainValidation(BattlegroupMember, message, messagesplit, client, Battlegroup)
        BattlegroupMember.battlegroupRank = messagesplit[2]
        BattlegroupMember.save()
        Battlegroup.members.push(BattlegroupMember)
        Battlegroup.save()
        message.channel.send("A member has been added to this battlegroup!")
    }
    else {
        await captainValidation(BattlegroupMember, message, messagesplit, client, Battlegroup)
        BattlegroupMember.battlegroupRank = messagesplit[2]
        BattlegroupMember.save()
        message.channel.send("The role of a Member in this Battlegroup has been updated")
    }
}

async function captainValidation(BattlegroupMember, message, messagesplit, client, Battlegroup) {
    if(messagesplit[2].toLowerCase() === "captain") {
        message.channel.send(`Are you sure you want to set ${BattlegroupMember.name} as the new captain? Yes/No`)
        let response
        try {
            response = await message.channel.awaitMessages(message2 => message2.content.length < 4 , {
                maxMatches: 1,
                time: 30000,
                errors: ['time', 'length']
            });
        }
        catch (err) {
            console.error(err);
            return message.channel.send("Invalid confirmation.");
        }
        if(response.first().content.toLowerCase() === "yes") {
            message.channel.send("Which new role do you wish to give to the previous captain?")
            let response2
            try {
                response2 = await message.channel.awaitMessages(message2 => message2.content.length < 50 , {
                    maxMatches: 1,
                    time: 30000,
                    errors: ['time', 'length']
                });
            }
            catch (err) {
                console.error(err);
                return message.channel.send("Aborting captain change.");
            }
            if(response2.first().content.toLowerCase() === "captain") return message.channel.send("Nice joke, you cannot set him as Captain again to make a loop. Aborting process.")
            MemberModel.findOne({_id: Battlegroup.captain}, (err, Captain) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(!Captain) {
                    return message.channel.send("There's something weird about this")
                }
                else {
                    Captain.battlegroupRank = response2.first().content
                    Captain.save()
                }
            })
            Battlegroup.captain = BattlegroupMember._id
        }
        else if(response.first().content.toLowerCase() === "no") {
            return message.channel.send("Well! Seems like our captain remains the same!")
        }
        else {
            return message.channel.send("Invalid confirmation.");
        }
    }
}