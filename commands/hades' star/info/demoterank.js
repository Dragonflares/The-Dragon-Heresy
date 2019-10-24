let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "demoterank",
    category: "hades' star",
    subcategory: "info",
    description: "Demotes a player rank in a Corp.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(user)

        client.playersDB.ensure(`${targetb.id}`, new Player(targetb, message))

        const messagesplit = message.content.split(" ")
        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")
        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)
    }
}