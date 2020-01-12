let TechData = require("../../../Database/Hades' Star/techs.json")
const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')


module.exports = {
    name: "setbattleship",
    aliases: ["setbs"],
    category: "hades' star",
    subcategory: "ship",
    description: "Sets the Member's intended battleship for White Stars.",
    usage: "&setbattleship, then asnwer the bot's questions. Don't state any levels unless asked for. You can also modify weapon, supports, and shield indiviually.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator) {
            targetb = user
        }
        else return message.channel.send("You cannot set another Member's Battleship!")

        let member = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Battleship set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Battleship set")
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
                            return message.channel.send("The Member you attempted to request a Battleship from isn't from this Corporation.")
                    BattleshipModel.findOne({_id: Obtained.battleship}, (err, Battleship) => {
                        if(!Battleship) {
                            let NewBattleship = new BattleshipModel({
                                _id: new Mongoose.Types.ObjectId(),
                                support: []
                            })
                            Obtained.battleship = NewBattleship._id
                            createModifyBattleship(message, targetb, client, Obtained, NewBattleship)
    
                        }
                        else {
                            createModifyBattleship(message, targetb, client, Obtained, Battleship)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }
}

async function createModifyBattleship(message, targetb, client, Obtained, Battleship) {
    let battleshipname = []
    let battleshiplevel = []
    let battleshipweapon = []
    let battleshipshield = []
    let battleshipsupport = []
    let messagesplitted = message.content.split(" ")
    if(!messagesplitted[1] || messagesplitted[1].startsWith("<@")) {
        message.channel.send("Please name your battleship")
        try {
            battleshipname = await message.channel.awaitMessages(message2 => 
                message2.content.length < 16 && message2.author.id === targetb.id , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship name, check if it's larger than 15 characters.");
        }
        message.channel.send("Please state your battleship's level")
        try {
            battleshiplevel = await message.channel.awaitMessages(message2 => 
                message2.content < 7 && message2.content > 0 && message2.author.id === targetb.id , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship level.");
        }
        await message.channel.send("Please state your battleship's weapon")
        try {
            battleshipweapon = await message.channel.awaitMessages(message2 => TechData[message2] 
                && TechData[message2].Category === "Weapons" && message2.author.id === targetb.id, {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship weapon.");
        }

        let weapon = await (TechModel.findOne({name: battleshipweapon.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
        if(weapon.level === 0) return message.channel.send("You don't have this weapon researched!")

        await message.channel.send("Please state your battleship's shield")
        try {
            battleshipshield = await message.channel.awaitMessages(message2 => TechData[message2] 
                && TechData[message2].Category === "Shields" && message2.author.id === targetb.id, {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship shield.");
        }
        let shield = await (TechModel.findOne({name: battleshipshield.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
        if(shield.level === 0) return message.channel.send("You don't have this shield researched!")
        Battleship.name = battleshipname.first().content
        Battleship.level = battleshiplevel.first().content
        Battleship.weapon = weapon._id
        Battleship.shield = shield._id
        Battleship.support = []

        if(parseInt(battleshiplevel.first().content) > 1) {
            await message.channel.send("Please state your battleship's support modules, pressing enter between each of them")
            var i = 0
            for(i ; i < parseInt(battleshiplevel.first().content) - 1 ; i++) {
                try {
                    battleshipsupport = await message.channel.awaitMessages( message2 => (TechData[message2] 
                        && TechData[message2].Category === "Support" && message2.author.id === targetb.id) 
                        || (message2.content.toLowerCase() === "Empty"), {
                        maxMatches: 1,
                        time: 40000,
                        errors: ['time', 'name']
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Invalid battleship's support module.");
                }
                if(battleshipsupport.first().content == "Empty")
                    break
                let support = await (TechModel.findOne({name: battleshipsupport.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
                if(support.level === 0) return message.channel.send("You don't have this support module researched!")
                else {
                    Battleship.support.push(support)
                }
            }
        }
        Battleship.save()
        Obtained.save()
        return message.channel.send("Your battleship for white stars is now set.")

    }
    else {
        // if(!(client.playerDB.get(`${message.author.id}`, `battleship.name`))){
        //     return message.channel.send("You don't have any battleship set!")
        // }
        // if(messagesplitted[1].toLowerCase() === "weapon" || messagesplitted[1].toLowerCase() === "w"){
        //     message.channel.send("Please state your battleship's weapon after this message")
        //     try {
        //         battleshipweapon = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Weapons", {
        //             maxMatches: 1,
        //             time: 40000,
        //             errors: ['time', 'name']
        //         });
        //     } catch (err) {
        //         console.error(err);
        //         return message.channel.send("Invalid battleship weapon.");
        //     }
        //     let techlevelwep = await client.playerDB.get(`${message.author.id}`, `techs.${battleshipweapon.first().content}`)
        //     if(techlevelwep == 0) return message.channel.send("You don't have this weapon researched!")
        //     client.playerDB.set(`${message.author.id}`, `${battleshipweapon.first().content} ${techlevelwep}`, `battleship.weapon`)
        // }
        // else if(messagesplitted[1].toLowerCase() === "shield" || messagesplitted[1].toLowerCase() === "sh"){
        //     message.channel.send("Please state your battleship's shield after this message.")
        //     try {
        //         battleshipshield = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Shields", {
        //             maxMatches: 1,
        //             time: 40000,
        //             errors: ['time', 'name']
        //         });
        //     } catch (err) {
        //         console.error(err);
        //         return message.channel.send("Invalid battleship shield.");
        //     }
        //     let techlevelshield = await client.playerDB.get(`${message.author.id}`, `techs.${battleshipshield.first().content}`)
        // if(techlevelshield == 0) return message.channel.send("You don't have this shield researched!")
        // client.playerDB.set(`${message.author.id}`, `${battleshipshield.first().content} ${techlevelshield}`, `battleship.shield`)
        // }
        // else if(messagesplitted[1].toLowerCase() === "support" || messagesplitted[1].toLowerCase() === "sp"){
        //     battleshiplevel = client.playerDB.get(`${message.author.id}`, `battleship.level`)
        //     if(battleshiplevel < 2) return message.channel.send("Your battleship is not level 2 yet, you cannot use Support modules!")
        //     message.channel.send("Please state your battleship's support modules, pressing enter between each of them")
        //     var i = 0
        //     for(i ; i < battleshiplevel - 1 ; i++) {
        //         try {
        //             battleshipsupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
        //                 maxMatches: 1,
        //                 time: 40000,
        //                 errors: ['time', 'name']
        //             });
        //         } catch (err) {
        //             console.error(err);
        //             return message.channel.send("Invalid battleship's support module.");
        //         }
        //         let techlevel = await client.playerDB.get(`${message.author.id}`, `techs.${battleshipsupport.first().content}`)
        //         if(techlevel == 0) return message.channel.send("You don't have this support module researched!")
        //         client.playerDB.push(`${message.author.id}`, `${battleshipsupport.first().content} ${techlevel}`, `battleship.support`)
        //     }
        // }
        // else {
        //     return message.channel.send("Either you requested an invalid parameter to change, or you tried to change the name or the level of the battleship. For that, the entire ship must be reset.")
        // }
        // return message.channel.send("Your battleship for white stars is now set.")
    }
}