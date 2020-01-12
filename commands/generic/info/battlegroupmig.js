const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')
const TechData = require("../../../Database/Hades' Star/techs.json")
const Cormyr = require("../../../player.js")



module.exports = {
    name: "battlemigration",
    aliases: ["battmig"],
    category: "generic",
    subcategory: "info",
    description: "Developer command only.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        let corpmembers = message.guild.members
        GuildModel.findOne({corpId: message.guild.id.toString()},(err, corp) => {
            if(err) console.log(err)
            else {
                let corpBeta = corp
                if(!corp) {
                    corpBeta = new GuildModel({
                        _id: new Mongoose.Types.ObjectId(),
                        corpId: message.guild.id.toString(),
                        name: message.guild.name
                    })
                    corpBeta.save().catch(err => console.log(err))
                }
                MigrateBattlegroup(message,client, corpBeta)
                setTimeout(SaveCorp, 25000, corpBeta, message)
                corpmembers.forEach(member => {
                    MemberModel.findOne({discordId: member.id.toString()}, (err, corpMember) => {
                        if(err) console.log(err)
                        else{
                            client.playerDB.ensure(`${member.id}`, Cormyr.player(member, message))
                            if(!corpMember){}
                            else{
                                MigrateBattleship(member, message, client)
                                MigrateMiner(member, message, client)
                                MigrateTransport(member, message, client)
                            }
                        }
                    })
                })
            }
        })
    }
}

async function MigrateBattlegroup(message, client, corpBeta) {
    let battlegroup1name = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
    let battlegroup1captain = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.captain")
    let battlegroup2name = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
    let battlegroup2captain = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.captain")
    if(!battlegroup1name){}
    else{
        let battlegroup1 = new BattlegroupModel(
            {
                _id: new Mongoose.Types.ObjectId,
                Corp: message.guild.id.toString(),
                name: battlegroup1name
            }
        )
        let battlegroup1Members = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.members")
        battlegroup1Members.forEach(member => {
            MemberModel.findOne({discordId: member.toString()}, (err, ObtainedMember) => {
                if(member === battlegroup1captain) {
                    battlegroup1.captain = ObtainedMember._id
                }
                let knownbattlegroup = "battlegroup1"
                ObtainedMember.battlegroupRank =  client.playersRolePrimeDB.set(`${member}`, `role${knownbattlegroup}`)
                ObtainedMember.save()
                battlegroup1.members.push(ObtainedMember)
            })
        })
        corpBeta.battlegroups.push(battlegroup1)
        setTimeout(SaveBattlegroup, 5000, battlegroup1)
    }
    if(!battlegroup2name) {}
    else {
        let battlegroup2 = new BattlegroupModel(
            {
                _id: new Mongoose.Types.ObjectId,
                Corp: message.guild.id.toString(),
                name: battlegroup2name
            }
        )
        let battlegroup2Members = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.members")
        battlegroup2Members.forEach(member => {
            MemberModel.findOne({discordId: member.toString()}, (err, ObtainedMember) => {
                if(member === battlegroup2captain) {
                    battlegroup2.captain = ObtainedMember._id
                }
                let knownbattlegroup = "battlegroup2"
                ObtainedMember.battlegroupRank =  client.playersRolePrimeDB.set(`${member}`, `role${knownbattlegroup}`)
                ObtainedMember.save()
                battlegroup2.members.push(ObtainedMember)
            })
        })
        corpBeta.battlegroups.push(battlegroup2)
        setTimeout(SaveBattlegroup, 12000, battlegroup2)
    }
}

async function MigrateBattleship(member, message, client) {
    let battleshipname = client.playerDB.get(`${member.id}`, `battleship.name`)
    if(!battleshipname) {message.channel.send("Member: " + member.nickname + " had no battleship")}
    else
    {
        let battleshiplevel = client.playerDB.get(`${member.id}`, `battleship.level`)
        let battleshipweapon = client.playerDB.get(`${member.id}`, `battleship.weapon`).split(" ")[0]
        let battleshipshield = client.playerDB.get(`${member.id}`, `battleship.shield`).split(" ")[0]
        let Battleship = new BattleshipModel({
            _id: new Mongoose.Types.ObjectId,
            name: battleshipname,
            level: battleshiplevel
        })
        TechModel.findOne({name: battleshipweapon, playerId: member.id},
            (err, techrequest) => {
                Battleship.weapon = techrequest._id
            })
        TechModel.findOne({name: battleshipshield, playerId: member.id},
            (err, techrequest) => {
                Battleship.shield = techrequest._id
            })    
        if(battleshiplevel > 1) {
            let battleshipsupports = client.playerDB.get(`${member.id}`, `battleship.support`)
            for( let support in battleshipsupports){
                let supportName = battleshipsupports[support].split(" ")[0]
                TechModel.findOne({name: supportName, playerId: member.id},
                    (err, techrequest) => {
                        Battleship.support.push(techrequest)
                    })  
            }
        }
        MemberModel.findOneAndUpdate({discordId: member.id.toString()},{
            $set: {battleship: Battleship._id}
        }, (err, newThing) =>
        {
            message.channel.send("Added " + Battleship.name)
        })
        setTimeout(SaveBattleship, 20000, Battleship)
        message.channel.send(member.nickname + "'s " + battleshipname + " has been updated")
    }
}

async function MigrateMiner(member, message, client) {
    let minername = client.playerDB.get(`${member.id}`, `miner.name`)
    if(!minername) {message.channel.send("Member: " + member.nickname + " had no miner")}
    else
    {
        let minerlevel = client.playerDB.get(`${member.id}`, `miner.level`)
        let Miner = new MinerModel({
            _id: new Mongoose.Types.ObjectId,
            name: minername,
            level: minerlevel
        })
        if(minerlevel > 2) {
            let minersupport = client.playerDB.get(`${member.id}`, `miner.support`).split(" ")[0]
            TechModel.findOne({name: minersupport, playerId: member.id},
                (err, techrequest) => {
                    Miner.support = techrequest._id
                })
        }
        let minerMining = client.playerDB.get(`${member.id}`, `miner.mining`)
        for( let miningAbout in minerMining){
            let miningName = minerMining[miningAbout].split(" ")[0]
            TechModel.findOne({name: miningName, playerId: member.id},
                (err, techrequest) => {
                    Miner.mining.push(techrequest)
                })  
        }
        MemberModel.findOneAndUpdate({discordId: member.id.toString()},{
            $set: {miner: Miner._id}
        }, (err, newThing) =>
        {
            message.channel.send("Added " + Miner.name)
        })
        setTimeout(SaveMiner, 30000, Miner)
        message.channel.send(member.nickname + "'s " + minername + " has been updated")
    }
}

async function MigrateTransport(member, message, client) {
    let transportname = client.playerDB.get(`${member.id}`, `transport.name`)
    if(!transportname) {message.channel.send("Member: " + member.nickname + " had no transport")}
    else
    {
        let transportlevel = client.playerDB.get(`${member.id}`, `transport.level`)
        let transportsupport = client.playerDB.get(`${member.id}`, `transport.support`).split(" ")[0]
        let Transport = new TransportModel({
            _id: new Mongoose.Types.ObjectId,
            name: transportname,
            level: transportlevel
        })
        if(transportlevel > 2) {
            TechModel.findOne({name: transportsupport, playerId: member.id},
                (err, techrequest) => {
                    Transport.support = techrequest._id
                })
        }

        let transportEconomy = client.playerDB.get(`${member.id}`, `transport.economy`)
        for( let economyAbout in transportEconomy){
            let economyName = transportEconomy[economyAbout].split(" ")[0]
            TechModel.findOne({name: economyName, playerId: member.id},
                (err, techrequest) => {
                    Transport.economy.push(techrequest)
                })  
        }

        MemberModel.findOneAndUpdate({discordId: member.id.toString()},{
            $set: {transport: Transport._id}
        }, (err, newThing) =>
        {
            message.channel.send("Added " + Transport.name)
        })
        setTimeout(SaveTransport, 30000, Transport)
        message.channel.send(member.nickname + "'s " + transportname + " has been updated")
    }
}

async function SaveCorp(corpBeta, message){
    GuildModel.findByIdAndUpdate({_id: corpBeta._id},
        {$set:{battlegroups: corpBeta.battlegroups}},
        (err, newThing) =>
        {
            message.channel.send("Added " + corpBeta.battlegroups.length)
        })
}

async function SaveBattleship(battleship){
    battleship.save()
}

async function SaveMiner(miner){
    miner.save()
}

async function SaveTransport(transport){
    transport.save()
}

async function SaveBattlegroup(battlegroup){
    battlegroup.save()
}