let Player = require("../../../player.js")

module.exports = {
    name: "setwhitestar",
    aliases: ["sws"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Sets if you are aviable or not for a White Star.",
    usage: "&setwhitestar <yes/no>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You can't set another player's white star aviability!")

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        const messagesplit = message.content.split(" ")
        if(messagesplit[1].toLowerCase() === "yes"){
            client.playerDB.set(`${message.author.id}`, "Yes", "whitestaraviability")
        }
        else if(messagesplit[1].toLowerCase() === "no"){
            client.playerDB.set(`${message.author.id}`, "No", "whitestaraviability")
        } 
        else return message.channel.send("Invalid declaration.")
        
        return message.channel.send("Your White star aviability has been set.")
    }
}