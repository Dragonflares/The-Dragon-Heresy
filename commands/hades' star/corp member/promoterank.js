const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')

module.exports = {
    name: "promote",
    aliases: ["prom"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Promotes a player in a Corp.",
    usage: "&promote <member>.",
    run: async (client, message, args) => {
        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")

        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)

        if(!member) {
            let MemberResult = (await MemberModel.findOne({discordId: author.id.toString()}))
            if(!MemberResult)
                return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
            else{
                MemberModel.findOne({discordId: author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                    if(err)
                        return console.log(err)
                    if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                        if(author.hasPermission("ADMINISTRATOR")){
                            let rank = MemberDataResult.rank
                            switch(rank){
                                case "Member": {
                                    ModifyRank(author, "Senior Member")
                                    break
                                }
                                case "Senior Member": {
                                    ModifyRank(author, "Officer")
                                    break
                                }
                                case "Officer": {
                                    let guildmembers = message.guild.members.values()
                                    for(let member of guildmembers)
                                    {
                                        let possibleFO = MemberModel.findOne({discordId: member.id.toString()})
                                        if(!possibleFO){}
                                        else{
                                            memberrank = possibleFO.rank
                                            if(memberrank === "First Officer"){
                                                let membername = possibleFO.name
                                                return message.channel.send(`There's already a First Officer! It's ${membername}.`)
                                            }
                                        }
                                    }
                                    ModifyRank(author, "First Officer")
                                    break
                                }
                                case "First Officer": {
                                    return message.channel.send("There's no rank above yours!")
                                }
                            }
                            return message.channel.send("You've been promoted successfully!")
                        }
                        else return message.channel.send("You can't promote yourself!")
                    }
                    else 
                        return message.channel.send("You aren't on your Corporation's server!")
                })
            }
        }
        else {
            if(member.id === author.id) return message.channel.send("You can't promote yourself like this! Don't mention anyone instead")
            let memberrank
            let error = false
            let checkedMemberResult = (await MemberModel.findOne({discordId: member.id.toString()}))
            if(!checkedMemberResult)
                return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
            else{
                MemberModel.findOne({discordId: member.id.toString()}).populate('Corp').exec((err, CheckedMemberDataResult) => {
                    if(err) {
                        error = true
                        console.log(err)
                        return message.channel.send("An unexpected error ocurred, please contact my creator.")
                    }
                    if(CheckedMemberDataResult.Corp.corpId != message.guild.id.toString()) {
                        error = true
                        return message.channel.send("You can not promote a Member of another Corporation.")
                    }
                    else
                        memberrank = CheckedMemberDataResult.rank
                })
            }
            if(error) return
            let MemberResult = (await MemberModel.findOne({discordId: author.id.toString()}))
            if(!MemberResult)
                return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
            else {
                MemberModel.findOne({discordId: author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                    if(err) {
                        console.log(err)
                        return message.channel.send("An unexpected error ocurred, please contact my creator.")
                    }
                    else if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                        let authorrank = MemberDataResult.rank         
                        if(author.hasPermission("ADMINISTRATOR")) {
                            switch(authorrank){
                                case "Officer": {
                                    if(memberrank === "Officer") return message.channel.send("You can't promote another Officer!")
                                    if(memberrank === "First Officer") return message.channel.send("You can't promote your First Officer beyond!")
                                    if(memberrank === "Senior Member") {
                                        ModifyRank(member, "Officer")
                                        return message.channel.send("You have succesfully promoted the other Member")
                                    }
                                    else {
                                        ModifyRank(member, "Senior Member")
                                        return message.channel.send("You have succesfully promoted the other member")
                                    }
                                }
                                case "First Officer": {
                                    if(memberrank === "Officer") {
                                        message.channel.send("Are you sure you want to promote this person to First Officer? Yes/No")
                                        let response
                                        try {
                                            response = await (message.channel.awaitMessages(message2 => message2.content.length < 4 , {
                                                maxMatches: 1,
                                                time: 20000,
                                                errors: ['time', 'length']
                                            }))
                                        }
                                        catch (err) {
                                            console.error(err);
                                            return message.channel.send("Invalid confirmation.");
                                        }
                                        if(response.first().content.toLowerCase() === "yes") {
                                            ModifyRank(member, "First Officer")
                                            ModifyRank(author, "Officer")
                                            return message.channel.send("You've succesfully promoted this person to First Officer. You have been demoted to Officer.")
                                        }
                                        if(response.first().content.toLowerCase() === "no") {
                                            return message.channel.send("You are still our First Officer! Whew!")
                                        }
                                        else {
                                            return message.channel.send("Invalid confirmation.");
                                        }
                                    }
                                    else if(memberrank === "Senior Member") {
                                        ModifyRank(member, "Officer")
                                        return message.channel.send("You have succesfully promoted the other member")
                                    }
                                    else {
                                        ModifyRank(member, "Senior Member")
                                        return message.channel.send("You have succesfully promoted the other member")
                                    }
                                }
                                default: {
                                    return message.channel.send("You must be an officer to promote someone!")
                                }
                            }
                        }
                    }
                    else {
                        return message.channel.send("You aren't on your Corporation's server!")
                    }
                })
            }
        }

    }
}

async function ModifyRank(target, NewRank) {
    MemberModel.findOneAndUpdate({discordId: target.id.toString()}, {rank: NewRank})
    .catch(err => console.log(err))
}