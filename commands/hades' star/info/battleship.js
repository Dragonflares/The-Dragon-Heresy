let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playerbattleship",
    category: "hades' star",
    subcategory: "info",
    description: "Shows the current white star battleship a player has.",
    usage: "&playerbattleship (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playersDB.ensure(`${targetb.id}`, Player.player(targetb, message))


        const messagesplit = message.content.split(" ")
        let targetid
        const user = message.mentions.users.first()
        if(!user) {
            targetid = message.author.id
        }
        else {
            targetid = user.id
        }  
        let battleshipname = client.playersDB.get(`${targetid}`, `battleship.name`)
        if(battleshipname === "") return message.channel.send("No battleship has been set")
        let battleshipEmbed = new RichEmbed().setColor("RED")
        battleshipEmbed.setTitle(`**${battleshipname}**`)
        let battleshiplevel = client.playersDB.get(`${targetid}`, `battleship.level`)
        battleshipEmbed.addField("Level", `${battleshiplevel}`)
        let battleshipweapon = client.playersDB.get(`${targetid}`, `battleship.weapon`)
        battleshipEmbed.addField("Weapon", `${battleshipweapon}`)
        let battleshipshield = client.playersDB.get(`${targetid}`, `battleship.shield`)
        battleshipEmbed.addField("Shield", `${battleshipshield}`)
        if(battleshiplevel > 1) {
            let battleshipsupports = client.playersDB.get(`${targetid}`, `battleship.support`)
            let supports = ""
            for( let support in battleshipsupports){
                supports += `${battleshipsupports[support]}\n`
            }
            battleshipEmbed.addField("Support", `${supports}`)
        }
        return message.channel.send(battleshipEmbed)
    }
}