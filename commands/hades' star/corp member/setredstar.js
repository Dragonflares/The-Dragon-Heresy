let Player = require("../../../player.js")

module.exports = {
    name: "setredstar",
    aliases: ["srs"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Changes your red star level.",
    usage: "&setredstar <level>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You can't set another player's red star level!")

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        const messagesplit = message.content.split(" ")
        let level = messagesplit[1]
        if(isNaN(parseInt(level))) return message.channel.send("Invalid RedStar level.")
        client.playerDB.set(`${message.author.id}`, messagesplit[1], "rslevel")
        return message.channel.send("Your RedStar level has been set.")
    }
}