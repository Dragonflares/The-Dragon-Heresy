let Player = require("../../../player.js")
const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
const TechModel = require("../../../Models/Techs")

module.exports = {
    name: "setwhitestar",
    aliases: ["sws"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Sets if you are avaible or not for a White Star.",
    usage: "&setwhitestar <yes/no>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator) 
            targetb = user
        else return message.channel.send("You can't set another player's white star avaibility!")
        
        let WSAviable
        const messagesplit = message.content.split(" ")
        if(messagesplit[1].toLowerCase() === "yes"){
            WSAviable = "Yes"
        }
        else if(messagesplit[1].toLowerCase() === "no"){
            WSAviable = "No"
        } 
        else return message.channel.send("Invalid declaration.")

        let MemberResult = (await MemberModel.findOne({discordId: message.author.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            MemberModel.findOne({discordId: message.author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                    ModifyRedStarLevel(targetb, WSAviable, message)      
                }
                else {
                    return message.channel.send("You aren't on your Corporation's server!")
                }
            })
        }
        return message.channel.send("Your White star avaibility has been set.")
    }
}

async function ModifyRedStarLevel(target, WSAviable, message) {
    MemberModel.findOneAndUpdate({discordId: target.id.toString()}, {wsStatus: WSAviable})
    .catch(err => console.log(err))
}