const TechData = require("../../../techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "changecorp",
    aliases: ["ccorp"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Sets your corp as the Server you are now at.",
    usage: "&changecorp.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot change another person's corp!")

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        client.playerDB.set(`${targetb.id}`, "Member", "rank")
        client.playerDB.set(`${targetb.id}`, `${message.guild.id}`, "corp")

        return message.channel.send(`I've changed your home corp to ${message.guild.name}`)
    }
}