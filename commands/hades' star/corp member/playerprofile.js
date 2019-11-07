let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playerprofile",
    aliases: ["prof"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows info about yourself or a certain player.",
    usage: "&playerprofile (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

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
        if(!target.nickname) ProfileEmbed.setTitle(`Player: **${target.user.username}**`)
        else ProfileEmbed.setTitle(`Player: **${target.nickname}**`)
        let playerrank = client.playersPrimeDB.get(`${target.id}`,`rank`)
        let playercorp = client.playersPrimeDB.get(`${target.id}`,`corp`)
        let playertimezone = client.playersPrimeDB.get(`${target.id}`,`timezone`)
        ProfileEmbed.addField(`*Rank*`, playerrank)
        ProfileEmbed.addField(`*Time Zone*`, `GMT ${playertimezone}`) 
        ProfileEmbed.setFooter("For the techs this player has, use &playertech, for their white star battleship, use &playerbattleship")
        
        return message.channel.send(ProfileEmbed)
    }
}