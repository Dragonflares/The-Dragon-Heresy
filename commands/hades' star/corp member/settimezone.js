let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "settimezone",
    aliases: ["stime"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Changes your time zone, please use +/-<number>.",
    usage: "&settimezone +/-<number>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You can't set another player's time zone.")

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        const messagesplit = message.content.split(" ")
        if(!(messagesplit[1].startsWith("+") || messagesplit[1].startsWith("-"))) return message.channel.send("Invalid time zone.")
        let timezone = messagesplit[1].substring(1)
        if(isNaN(parseInt(timezone))) return message.channel.send("Invalid time zone.")
        client.playersPrimeDB.set(`${message.author.id}`, messagesplit[1], "timezone")
        return message.channel.send("Your timezone has been set.")
    }
}