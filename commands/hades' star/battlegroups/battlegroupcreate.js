let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "createbattlegroup",
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Creates a white star battlegroup and assigns it a captain.",
    usage: "&createbattlegroup <name> <captain>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must assign a captain to this battlegroup!")
        else targetb = message.guild.member(user)
        client.playersRole.ensure(`${targetb.id}`, Battlegroup.battlegroupMember())
        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.battlegroups.ensure(`${message.guild.id}`, Battlegroup.guildbattlegroup())

        let authorrank = client.playersPrimeDB.get(`${message.author.id}`, "rank")
        if(authorrank === "Officer" || authorrank ==="First Officer"){}
        else return message.channel.send("You must be at least an Officer to create a battlegroup!")

        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || messagesplit[1].contains("<@")) return message.channel.send("You must specify a battlegroup name!")

        let battlegroup1 = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
        let newbattlegroup = Battlegroup.battlegroup(message)
        newbattlegroup.name = messagesplit[1]
        newbattlegroup.captain = targetb.id
        
        if(!battlegroup1) {
            client.battlegroups.set(`${message.guild.id}`, newbattlegroup, "battlegroup1")
            client.battlegroups.push(`${message.guild.id}`, targetb.id, "battlegroup1.members")
            client.battlegroups.set(`${message.guild.id}`, targetb.id, "battlegroup1.captain")
        }
        else {
            let battlegroup2 = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
            if(!battlegroup2) {
                
                client.battlegroups.set(`${message.guild.id}`, newbattlegroup, "battlegroup2")
                client.battlegroups.push(`${message.guild.id}`, targetb.id, "battlegroup2.members")
                client.battlegroups.set(`${message.guild.id}`, targetb.id, "battlegroup2.captain")
            }
            else return message.channel.send("You are already at the maximum allowed amount of battlegroups!")
        }
        client.playersRole.set(`${targetb.id}`, "Captain", "role")
        client.playersRole.set(`${targetb.id}`, `${targetb.id}`, "player")

        return message.channel.send("Battlegroup set!")
    }
}
