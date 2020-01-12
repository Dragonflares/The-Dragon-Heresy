const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require("fs")
const {Schema, model} = require('mongoose')
const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')
const TechData = require("../../../techs.json")
const Cormyr = require("../../../player.js")



module.exports = {
    name: "migration",
    aliases: ["mig"],
    category: "generic",
    subcategory: "info",
    description: "Developer command only.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        let corpmembers = message.guild.members
        client.db.createCollection("Corp")
        client.db.createCollection("Member")
        client.db.createCollection("Tech")
        client.db.createCollection("Battleship")
        client.db.createCollection("Battlegroup")
        client.db.createCollection("Miner")
        client.db.createCollection("Transport")
        GuildModel.findOne({corpId: message.guild.id.toString()},(err, corp) => {
            if(err) console.log(err)
            else {
                let corpBeta = corp
                if(!corp) {
                    corpBeta = new GuildModel({
                        _id: new Mongoose.Types.ObjectId(),
                        corpId: message.guild.id.toString(),
                        name: message.guild.name,
                        members: []
                    })
                }
                corpmembers.forEach(member => {
                    MemberModel.findOne({discordId: member.id.toString()}, (err, corpMember) => {
                        if(err) console.log(err)
                        else{
                            client.playerDB.ensure(`${member.id}`, Cormyr.player(member, message))
                            let player = corpMember
                            if(!corpMember)
                            {
                                if(member.nickname == null) {
                                    message.channel.send(member.user.username + " not part of the corporation")
                                }
                                else {
                                    MigratePlayer(member, message, client, corpBeta)
                                    setTimeout(saveCorporation, 25000, corpBeta)
                                }
                            }
                        }
                    })
                })
            }
        })
    }
}

async function MigratePlayer(member, message, client, corpBeta) {
    let ThePlayer
    ThePlayer = new MemberModel({
        _id: new Mongoose.Types.ObjectId(),
        name: member.nickname,
        discordId: member.id.toString(),
        rank: client.playerDB.get(`${member.id}`,`rank`),
        rslevel: client.playerDB.get(`${member.id}`,`rslevel`),
        wsStatus: client.playerDB.get(`${member.id}`,`whitestaraviability`),
        Corp: corpBeta._id,
        timezone: client.playerDB.get(`${member.id}`,`timezone`),
    })
    corpBeta.members.push(ThePlayer)
    let order = 1
    for(let techname in TechData){
        MigrateTech(member, techname, order, ThePlayer, client)
        order++
    }
    ThePlayer.save().catch(err => console.log(err)).then(
            message.channel.send("Added to the Database: " + ThePlayer.name)
        )
}

async function MigrateTech(member, techname, order, player, client) {
    let techlevel = client.playerDB.get(`${member.id}`, `techs.${techname}`)
    let TECH = new TechModel({
        _id: new Mongoose.Types.ObjectId(),
        name: techname,
        level: techlevel,
        category: TechData[techname].Category,
        order: order,
        playerId: member.id.toString()
    })
    player.techs.push(TECH)
    TECH.save().catch(err => console.log(err))
}

async function saveCorporation(corpBeta) {
    corpBeta.save()
}