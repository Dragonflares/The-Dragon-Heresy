let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playertransport",
    category: "hades' star",
    subcategory: "ship",
    description: "Shows the current white star transport a player has.",
    usage: "&playertransport (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))


        const messagesplit = message.content.split(" ")
        let targetid
        const user = message.mentions.users.first()
        if(!user) {
            targetid = message.author.id
        }
        else {
            targetid = user.id
        }  
        let transportname = client.playersPrimeDB.get(`${targetid}`, `transport.name`)
        if(transportname === "") return message.channel.send("No transport has been set")
        let transportEmbed = new RichEmbed().setColor("#fdff00")
        transportEmbed.setTitle(`**${transportname}**`)
        let transportlevel = client.playersPrimeDB.get(`${targetid}`, `transport.level`)
        transportEmbed.addField("Level", `${transportlevel}`)
        let transportsupport = client.playersPrimeDB.get(`${targetid}`, `transport.support`)
        transportEmbed.addField("Support", `${transportsupport}`)
        if(transportlevel > 1) {
            let transporteconomys = client.playersPrimeDB.get(`${targetid}`, `transport.economy`)
            let economys = ""
            for( let economy in transporteconomys){
                economys += `${transporteconomys[economy]}\n`
            }
            transportEmbed.addField("Economy", `${economys}`)
        }
        return message.channel.send(transportEmbed)
    }
}