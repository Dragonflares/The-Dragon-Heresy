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
    name: "resign",
    aliases: ["ccorp"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Removes you from your previous Corporation.",
    usage: "&resign.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot force another Member to resign their Corporation!")

        let MemberResult = (await MemberModel.findOne({discordId: targetb.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            MemberModel.findOne({discordId: targetb.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === "-1")
                    return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
                else {
                    LeaveCorporation("Member", message, MemberDataResult)
                }
            })
        }
        return message.channel.send(`You've succesfully resigned your corp`)
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

async function LeaveCorporation(newRank, message, MemberDataResult) {
    let OldCorporation
    GuildModel.findOne({corpId: MemberDataResult.Corp.corpId}, (err, ObtainedOne) => {
        if(err) return console.log(err)
        else {
            LeaveBattlegroup(ObtainedOne, MemberDataResult)   
            let remainingMembers = ObtainedOne.members.filter(member => member.toString() != MemberDataResult._id.toString())
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
            setTimeout(assignNewCorp, 1000, newRank, message, NewCorporation, MemberDataResult)
        }
        else {
            NewCorporation = ObtainedOne
            setTimeout(assignNewCorp, 1000, newRank, message, NewCorporation, MemberDataResult)
        }
        
    }))
    
}

async function assignNewCorp(newRank, message, corp, MemberDataResult) {
    MemberDataResult.rank = newRank
    MemberDataResult.battlegroupRank = ""
    MemberDataResult.Corp = corp._id
    MemberDataResult.save().catch(err => console.log(err))
}

async function saveNewArrival(Arrival){
    Arrival.save().catch(err => console.log(err))
}