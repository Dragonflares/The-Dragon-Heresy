const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')
const TechData = require("../../../techs.json")

module.exports = {
    name: "removemember",
    aliases: ["rm"],
    category: "hades' star",
    subcategory: "officers",
    description: "Removes an unowrthy member from the Corporation.",
    usage: "&removeMember <@user>",
    run: async (client, message, args) => {
        let target
        if(message.mentions.users.length > 1) return message.channel.send("You may only remove one person at a time.")
        if(message.mentions.roles.length > 0) message.channel.send("I'll ignore that you just tagged a role.")
        let user = message.mentions.users.first()
        if(!user){
            return message.channel.send("You must tag a Member to remove from this Corporation.")
        }
        else {
            await message.guild.members.forEach(member => {
                if(member.id === user.id) {
                    target = member
                }  
            })
        }
        let author
        await message.guild.members.forEach(member => {
            if(member.id === message.author.id) {
                author = member
            }  
        })
        if(message.author.id === client.creator) {    
            removeMember("Member", message, target)            
        }
        else {
            if(!author.hasPermission("ADMINISTRATOR")) {
                if(!author.hasPermission("MODERATOR")) {
                    let MemberResult = (await MemberModel.findOne({discordId: author.id}))
                    if(!MemberResult)
                        return message.channel.send("You aren't a member of any Corporation")
                    else{
                        MemberResult.populate("Corp").then(MemberDataResult => {
                            if(MemberDataResult.Corp.corpId != message.guild.id.toString())
                                return message.channel.send("You aren't a member of this Corporation")
                            else{
                                if(MemberDataResult.rank != "First Officer" || MemberDataResult.rank != "Officer")
                                    return message.channel.send("You don't have the rank to remove a member from your Corporation, talk to an Officer or a Server Admin to remove this person from the Corp")
                                else
                                return removeMember("Member", message, target)
                            }
                        }).catch(err => console.log(err))
                    }
                }
                else
                    return removeMember("Member", message, target)
            }
            else
                return removeMember("Member", message, target)
        }
    }
}


async function LeaveBattlegroup(ObtainedCorp, MemberDataResult) {
    ObtainedCorp.battlegroups.forEach(battlegroup => {
        BattlegroupModel.findOne({_id: battlegroup}, (err, result) => {
            if(err) {
                message.channel.send("An unexpected error ocurred, please contact my creator.")
                return console.log(err)
            }
            else if(!result) {
                return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
            }
            else {
                let newMemberList = result.members.filter(member => member.toString() != MemberDataResult._id)
                if(MemberDataResult.battlegroupRank === "Captain") {
                    result.captain = newMemberList[1]
                    MemberModel.findOne({_id: result.captain}, (err, result) => {
                        if(err) return console.log(err)
                        else {
                            result.battlegroupRank = "Captain"
                            result.save()
                        }
                    }) 
                }
                if(newMemberList.length === result.members.length){}
                else {
                    result.members = newMemberList
                    result.save()
                }
            }
        })
    })
}

async function removeMember(newRank, message, target) {
    let MemberResult = (await MemberModel.findOne({discordId: target.id.toString()}))
    if(!MemberResult)
        return message.channel.send("This member has never been part of any Corporations. He should join a Corporation before you try to remove him from it.")
    else {
        let MemberDataResult = await MemberModel.findOne({discordId: target.id.toString()}).populate('Corp').exec()
        if(MemberDataResult.Corp.corpId === "-1")
            return message.channel.send("This Member isn't part of any Corporations right now.")
        else
            MemberResult = MemberDataResult 
    }
    await GuildModel.findOne({corpId: message.guild.id}, (err, ObtainedOne) => {
        if(err) return console.log(err)
        else {
            LeaveBattlegroup(ObtainedOne, MemberResult)   
            let remainingMembers = ObtainedOne.members.filter(member => member.toString() != MemberResult._id.toString())
            ObtainedOne.members = remainingMembers
            ObtainedOne.save()
        }
    })

    let NewCorporation
    await (GuildModel.findOne({corpId: "-1"}, (err, ObtainedOne) => {
        if(err) return console.log(err)
        if(!ObtainedOne) {
            Corporation = new GuildModel({
                _id: new Mongoose.Types.ObjectId(),
                name: "No Corporation worth mentioning",
                corpId: "-1"
            })
            Corporation.save()
            NewCorporation = Corporation
            setTimeout(assignNewCorp, 1000, newRank, message, NewCorporation, MemberResult)
        }
        else {
            NewCorporation = ObtainedOne
            setTimeout(assignNewCorp, 1000, newRank, message, NewCorporation, MemberResult)
        }
        
    }))
    return message.channel.send("I've successfully removed this person from the Corp.")
    
}

async function assignNewCorp(newRank, message, corp, MemberDataResult) {
    MemberDataResult.rank = newRank
    MemberDataResult.battlegroupRank = ""
    MemberDataResult.Corp = corp._id
    MemberDataResult.save().catch(err => console.log(err))
}
