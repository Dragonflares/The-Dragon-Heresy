let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "demote",
    aliases: ["dem"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Demotes a player rank in a Corp.",
    usage: "&demote <member>.",
    run: async (client, message, args) => {

        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")
        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)
        if(!member) return message.channel.send("You haven't targeted anyone to demote!")
        
        if(member.id === author.id) return message.channel.send("You can't demote yourself like this! Someone else will have to")
        
        let memberrank
        let authorrank

        let checkedMemberResult = (await MemberModel.findOne({discordId: member.id.toString()}))
        if(!checkedMemberResult)
            return message.channel.send("The Member you selected isnt't part of any Corporation. You should add him to one first.")
        else{
            MemberModel.findOne({discordId: member.id.toString()}).populate('Corp').exec((err, CheckedMemberDataResult) => {
                if(err)
                    return console.log(err)
                if(CheckedMemberDataResult.Corp.corpId != message.guild.id.toString()) 
                    return message.channel.send("You can not demote a Member of another Corporation.")
                else
                    memberrank = CheckedMemberDataResult.rank
            })
        }
        
        let MemberResult = (await MemberModel.findOne({discordId: author.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            MemberModel.findOne({discordId: author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                    authorrank = MemberDataResult.rank       
                }
                else {
                    return message.channel.send("You aren't on your Corporation's server!")
                }
            })
        }
        if(authorrank === "Officer") {
            if(memberrank === "Member") return message.channel.send("You cannot demote this person any more! He's a Member!")
            if(memberrank === "Officer") return message.channel.send("You cannot demote a fellow officer!")
            if(memberrank === "First Officer") return message.channel.send("Yeah, nice try, you can't demote your First Officer!")
            if(memberrank === "SeniorMember") {
                ModifyRank(member, "Member")
                if(!member.nickname) return channel.message.send(`I've successfully demoted ${member.nickname}`)
                return channel.message.send(`I've successfully demoted ${member.user.username}`)
            }
        }
        else if(authorrank == "First Officer") {
            if(memberrank === "Member") return message.channel.send("You cannot demote this person any more! He's a Member!")
            if(memberrank === "Officer") {
                ModifyRank(member, "Senior Member")
                if(!member.nickname) return channel.message.send(`I don't know what you did, but hope you deserve this demotion ${member.user.username}`)
                return channel.message.send(`I don't know what you did, but hope you deserve this demotion ${member.nickname}`)
            }
            if(memberrank === "First Officer") return message.channel.send("Oh no, you cannot demote yourself. Promote someone else to First Officer if that's your wish.")
            if(memberrank === "SeniorMember") {
                ModifyRank(member, "Member")
                if(!member.nickname) return channel.message.send(`I've successfully demoted ${member.user.username}`)
                return channel.message.send(`I've successfully demoted ${member.nickname}`)
            }
        }
        else return message.channel.send("You have to be at least an Officer to demote someone!")
    }
}

async function ModifyRank(target, NewRank) {
    MemberModel.findOneAndUpdate({discordId: target.id.toString()}, {rank: NewRank})
    .catch(err => console.log(err))
}