const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')

module.exports = {
    name: "settimezone",
    aliases: ["stime"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Sets your time zone to GMT standard, please use +/-<number>.",
    usage: "&settimezone +/-<number>",
    run: async (client, message, args) => {
        let target
        let user = message.mentions.users.first()
        if(!user){
            target = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's timezone!")

        const messagesplit = message.content.split(" ")
        const ActualTimezone = messagesplit[1]

        if(!(ActualTimezone.startsWith("+") || ActualTimezone.startsWith("-"))) return message.channel.send("Invalid time zone.")
        let timezone = messagesplit[1]
        if(isNaN(parseInt(timezone))) return message.channel.send("Invalid time zone.")
        let MemberResult = (await MemberModel.findOne({discordId: target.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            MemberModel.findOne({discordId: target.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === message.guild.id.toString()) 
                    return ModifyTimeZone(target, timezone, message)    
                else 
                    return message.channel.send("You aren't on your Corporation's server!")
            })
        }
    }
}

async function ModifyTimeZone(target, NewTimezone, message) {
    MemberModel.findOneAndUpdate({discordId: target.id.toString()}, {timezone: NewTimezone})
    .catch(err => console.log(err))
    return message.channel.send(`Time Zone updated.`)
}