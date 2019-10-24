let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playerprofile",
    category: "hades' star",
    subcategory: "info",
    description: "Shows info about yourself or a certain player.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playersDB.ensure(`${targetb.id}`, new Player(targetb, message))

        const messagesplit = message.content.split(" ")
        let target
        const user = message.mentions.users.first()
        if(!user) {
            target = message.guild.member(message.author)
        }
        else {
            target = message.guild.member(user)
        }  

        let ProfileEmbed = new RichEmbed().setColor("RANDOM")
        ProfileEmbed.setTitle(`Player: **${target.nickname}**`)
        let playerrank = client.playersDB.get(`${target.id}`,`rank`)
        let playercorp = client.playersDB.get(`${target.id}`,`corp`)
        let playertimezone = client.playersDB.get(`${target.id}`,`timezone`)
        ProfileEmbed.addField(`*Rank*`, playerrank)
        ProfileEmbed.addField(`*Time Zone*`, `GMT ${playertimezone}`) 
        ProfileEmbed.setFooter("For the techs this player has, use &techdata, for their white star battleship, use &playerbattleship")
        
        return message.channel.send(ProfileEmbed)
    }
}