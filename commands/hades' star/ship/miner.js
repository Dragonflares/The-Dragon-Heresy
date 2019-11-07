let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playerminer",
    aliases: ["getm"],
    category: "hades' star",
    subcategory: "ship",
    description: "Shows the current white star miner a player has.",
    usage: "&playerminer (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))


        const messagesplit = message.content.split(" ")
        let targetid
        const user = message.mentions.users.first()
        if(!user) {
            targetid = message.author.id
        }
        else {
            targetid = user.id
        }  
        let minername = client.playerDB.get(`${targetid}`, `miner.name`)
        if(minername === "") return message.channel.send("No miner has been set")
        let minerEmbed = new RichEmbed().setColor("PURPLE")
        minerEmbed.setTitle(`**${minername}**`)
        let minerlevel = client.playerDB.get(`${targetid}`, `miner.level`)
        minerEmbed.addField("Level", `${minerlevel}`)
        let minersupport = client.playerDB.get(`${targetid}`, `miner.support`)
        minerEmbed.addField("Support", `${minersupport}`)
        if(minerlevel > 1) {
            let minerminings = client.playerDB.get(`${targetid}`, `miner.mining`)
            let minings = ""
            for( let mining in minerminings){
                minings += `${minerminings[mining]}\n`
            }
            minerEmbed.addField("Mining", `${minings}`)
        }
        return message.channel.send(minerEmbed)
    }
}