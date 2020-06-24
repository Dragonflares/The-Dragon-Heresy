const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
const TechModel = require("../../../Models/Techs")
const TechData = require("../../../techs.json")

module.exports = {
    name: "addmember",
    aliases: ["am"],
    category: "hades' star",
    subcategory: "officers",
    description: "Adds a new member to the Corporation.",
    usage: "&addmember <@user>",
    run: async (client, message, args) => {
        let target
        if(message.mentions.users.length > 1) return message.channel.send("You may only add one person at a time.")
        if(message.mentions.roles.length > 0) message.channel.send("I'll ignore that you just tagged a role.")
        let user = message.mentions.users.first()
        if(!user){
            return message.channel.send("You must tag a Member to add to this Corporation.")
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
            return addNewMember(client, message, target)
        }
        else {
            if(!author.hasPermission("ADMINISTRATOR")) {
                if(!author.hasPermission("MANAGE_GUILD")) {
                    let MemberResult = (await MemberModel.findOne({discordId: author.id}))
                    if(!MemberResult)
                        return message.channel.send("You aren't a member of any Corporation")
                    else{
                        MemberModel.findOne({discordId: author.id}).populate("Corp").then(MemberDataResult => {
                            if(MemberDataResult.Corp.corpId != message.guild.id.toString())
                                return message.channel.send("You aren't a member of this Corporation")
                            else{
                                if(MemberDataResult.rank === "First Officer" || MemberDataResult.rank === "Officer")
                                    return addNewMember(client, message, target)
                                else
                                    return message.channel.send("You don't have the rank to add a member to Corporation, talk to an Officer or a Server Admin to add this person to the Corp")
                            }
                        }).catch(err => console.log(err))
                    }
                }
                else
                    return addNewMember(client, message, target)
            }
            else
                return addNewMember(client, message, target)
        }
    }
}

async function addNewMember(client, message, target) {
    let MemberResult = (await MemberModel.findOne({discordId: target.id.toString()}))
    if(!MemberResult) {
        let targetName = ""
            if(!target.nickname) targetName = target.user.username
            else targetName = target.nickname
            let NewArrival = new MemberModel({
                _id: new Mongoose.Types.ObjectId(),
                name: targetName,
                discordId: target.id.toString(),
                rank: "Member",
                rslevel: 1,
                wsStatus: "No",
            })
            generateTechSection(NewArrival)
            addToCorporation(NewArrival, message)
            setTimeout(saveNewArrival, 5000, NewArrival)
            message.channel.send("I've successfully added " + NewArrival.name + " to this Corporation")
    }
    else{
        MemberModel.findOne({discordId: target.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
            if(err)
                return console.log(err)
            if(MemberDataResult.Corp.corpId === "-1"){
                addToCorporation(MemberDataResult, message)
                setTimeout(saveNewArrival, 5000, MemberDataResult)
                return message.channel.send("The Member has been added to the Corporation!")
            }
            else if(MemberDataResult.Corp.corpId != message.guild.id.toString())
                return message.channel.send("This Member is part of another Corporation called " + MemberDataResult.Corp.name + ". He should resign his previous Corp first.")
            else
                return message.channel.send("This Member is already part of this Corporation")
        })
    }
}

async function generateTechSection(Arrival){
    let order = 0
    for(let techname1 in TechData){
        let TECH = new TechModel({
            _id: new Mongoose.Types.ObjectId(),
            name: techname1,
            level: 0,
            category: TechData[techname1].Category,
            order: order,
            playerId: Arrival.discordId.toString()
        })
        Arrival.techs.push(TECH)
        TECH.save().catch(err => console.log(err))
        order++
    }
}

async function saveNewArrival(Arrival){
    Arrival.save().catch(err => console.log(err))
}
async function addToCorporation(Arrival, message){
    CorpModel.findOne({corpId: message.guild.id.toString()},(err, Corp) => {
        if(err) console.log(err)
        else {
            if(!Corp) {
                let Corporation = new CorpModel({
                    _id: new Mongoose.Types.ObjectId(),
                    name: message.guild.name,
                    corpId: message.guild.id.toString(),
                    members: []
                })
                Arrival.Corp = Corporation._id
                Corporation.members.push(Arrival)
                setTimeout(saveCorporation, 5000, Corporation)
                message.channel.send("Created this Coporation in the Hades' Corps area! It will be visible from any server who I am in when they ask for the known Corporations!")
            }
            else{
                Arrival.Corp = Corp._id
                Corp.members.push(Arrival)
                setTimeout(saveCorporation, 5000, Corp)
            }
        }
    }).catch(err => console.log(err))
}

async function saveCorporation(Corp){
    Corp.save().catch(err => console.log(err))
}