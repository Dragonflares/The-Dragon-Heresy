const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')

module.exports = {
    name: "setredstar",
    aliases: ["srs"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Changes your red star level.",
    usage: "&setredstar <level>",
    run: async (client, message, args) => {
        let target
        let user = message.mentions.users.first()
        if(!user){
            target = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's Red Star Level!")


        const messagesplit = message.content.split(" ")
        let level = messagesplit[1]
        if(!level) return message.channel.send("You must specifiy a valid Red Star level.")
        else if(isNaN(parseInt(level))) return message.channel.send("Invalid Red Star level.")
        let MemberResult = (await MemberModel.findOne({discordId: target.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            MemberModel.findOne({discordId: target.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === message.guild.id.toString()) 
                    return ModifyRedStarLevel(target, parseInt(level), message)    
                else 
                    return message.channel.send("You aren't on your Corporation's server!")
            })
        }
    }
}

async function ModifyRedStarLevel(target, NewRSLevel, message) {
    MemberModel.findOneAndUpdate({discordId: target.id.toString()}, {rslevel: NewRSLevel})
    .catch(err => console.log(err))
    return message.channel.send(`Red Star level updated.`)
}