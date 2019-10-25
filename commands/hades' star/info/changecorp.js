let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "changecorp",
    category: "hades' star",
    subcategory: "info",
    description: "Sets your corp as the Server you are now at.",
    usage: "&changecorp.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot change another person's corp!")

        client.playersDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        client.playersDB.set(`${targetb.id}`, "Member", "rank")
        client.playersDB.set(`${targetb.id}`, `${message.guild.id}`, "corp")

        return message.channel.send(`I've changed your home corp to ${message.guild.name}`)
    }
}