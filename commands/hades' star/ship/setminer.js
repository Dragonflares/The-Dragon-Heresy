const TechData = require("../../../techs.json")
const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')


module.exports = {
    name: "setminer",
    aliases: ["setm"],
    category: "hades' star",
    subcategory: "ship",
    description: "Sets the Member's intended miner for White Stars.",
    usage: "&setminer, then answer the bot's questions. Don't state any levels unless asked for.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator) {
            targetb = user
        }
        else return message.channel.send("You cannot set another Member's Miner!")

        let member = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Miner set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Miner set")
        }
        else {
            await MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString())
                        if(!user)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Miner from isn't from this Corporation.")
                    MinerModel.findOne({_id: Obtained.miner}, (err, Miner) => {
                        if(!Miner) {
                            let NewMiner = new MinerModel({
                                _id: new Mongoose.Types.ObjectId(),
                                mining: []
                            })
                            Obtained.miner = NewMiner._id
                            createModifyMiner(message, targetb, client, Obtained, NewMiner)
                        }
                        else {
                            createModifyMiner(message, targetb, client, Obtained, Miner)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }
}

async function createModifyMiner(message, targetb, client, Obtained, Miner){
    let minername
    let minerlevel
    let minermining
    let minersupport
    message.channel.send("Please name your miner")
    try {
        minername = await message.channel.awaitMessages(message2 => message2.content.length < 16 
            && message2.author.id === targetb.id, {
            maxMatches: 1,
            time: 40000,
            errors: ['time', 'length']
        });
    } catch (err) {
        console.error(err);
        return message.channel.send("Invalid miner name, check if it's larger than 15 characters.");
    }

    message.channel.send("Please state your miner's level")
    try {
        minerlevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 
            && message2.author.id === targetb.id, {
            maxMatches: 1,
            time: 40000,
            errors: ['time', 'level']
        });
    } catch (err) {
        console.error(err);
        return message.channel.send("Invalid miner level.");
    }
    
    if(parseInt(minerlevel.first().content) > 2) {
        message.channel.send("Please state your miner's support module")
        try {
            minersupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner's support module.");
        }
        let supporttech = await (TechModel.findOne({name: minersupport.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
        if(supporttech.level == 0) return message.channel.send("You don't have this support module researched!")
        Miner.support = supporttech._id
    }
    let repetitions
    if(parseInt(minerlevel.first().content) < 3) repetitions = parseInt(minerlevel.first().content)
    else repetitions = parseInt(minerlevel.first().content) - 1

    Miner.name = minername.first().content
    Miner.level = parseInt(minerlevel.first().content)
    Miner.mining = []

    message.channel.send("Please state your miner's mining modules, pressing enter between each of them.")
    var i = 0

    for(i ; i < repetitions ; i++) {
        try {
            minermining = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Mining", {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner's mining modules.");
        }
        let miningtech = await (TechModel.findOne({name: minermining.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
        if(miningtech.level == 0) return message.channel.send("You don't have this mining module researched!")
        Miner.mining.push(miningtech)
    }
    Miner.save()
    Obtained.save()
    return message.channel.send("Your miner for white stars is now set.")
}
