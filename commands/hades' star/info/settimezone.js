let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "settimezone",
    category: "hades' star",
    subcategory: "info",
    description: "Changes the player time zone, please use +/-<number>.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You can't set another player's time zone.")

        client.playersDB.ensure(`${targetb.id}`, new Player(targetb, message))

        const messagesplit = message.content.split(" ")
        if(!(messagesplit[1].startsWith("+") || messagesplit[1].startsWith("-"))) return message.channel.send("Invalid time zone.")
        let timezone = messagesplit[1].substring(1)
        if(isNaN(parseInt(timezone))) return message.channel.send("Invalid time zone.")
        client.playersDB.set(`${message.author.id}`, messagesplit[1], "timezone")
        return message.channel.send("Your timezone has been set.")
    }
}