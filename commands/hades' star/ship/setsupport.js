let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "setsupport",
    category: "hades' star",
    subcategory: "ship",
    description: "Sets which kind of support ship you are taking to the White Star.",
    usage: "&setsupport <supportcategory>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 0) return message.channel.send("You cannot set another player's support ship!")
        targetb = message.guild.member(message.author)
       
        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.playersRole.ensure(`${targetb.id}`, Battlegroup.battlegroupMember())

        let messagesplit = message.content.split(" ")
        if(!messagesplit[1])
            return message.channel.send("You must specifiy a category of support ship! Either Miner, or Transport.")
        else if(messagesplit[1].toLowerCase() === "transport") {
            client.playersRole.set(`${targetb.id}`, "Transport", "support")
        }
        else if(messagesplit[1].toLowerCase() === "miner") {
            client.playersRole.set(`${targetb.id}`, "Miner", "support")
        }
        else {
            return message.channel.send("You must specifiy a category of support ship! Either Miner, or Transport.")
        }
        return message.channel.send("Support ship set!")
    }
}