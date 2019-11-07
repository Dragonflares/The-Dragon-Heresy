let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "battlegroupcreate",
    aliases: ["bgcreate"],
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Creates a white star battlegroup and assigns it a captain.",
    usage: "&battlegroupcreate <name> <captain>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must assign a captain to this battlegroup!")
        else targetb = message.guild.member(user)
        client.playersRolePrimeDB.ensure(`${targetb.id}`, Battlegroup.battlegroupMember())
        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.battlegroups.ensure(`${message.guild.id}`, Battlegroup.guildbattlegroup())

        let authorrank = client.playerDB.get(`${message.author.id}`, "rank")
        if(authorrank === "Officer" || authorrank ==="First Officer"){}
        else return message.channel.send("You must be at least an Officer to create a battlegroup!")

        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || (messagesplit[1].indexOf("<@") > -1)) return message.channel.send("You must specify a battlegroup name!")

        let battlegroup1 = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
        let battlegroup2 = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
        
        if(battlegroup1 === messagesplit[1] || battlegroup2 === messagesplit[1]) return message.channel.send("You can't create a new battlegroup with the same name as one already created.")
        
        let newbattlegroup = Battlegroup.battlegroup(message)
        newbattlegroup.name = messagesplit[1]
        newbattlegroup.captain = targetb.id
        let knownbattlegroup
        if(!battlegroup1) {
            client.battlegroups.set(`${message.guild.id}`, newbattlegroup, "battlegroup1")
            client.battlegroups.push(`${message.guild.id}`, targetb.id, "battlegroup1.members")
            client.battlegroups.set(`${message.guild.id}`, targetb.id, "battlegroup1.captain")
            knownbattlegroup = "battlegroup1"
        }
        else {
            
            if(!battlegroup2) {
                
                client.battlegroups.set(`${message.guild.id}`, newbattlegroup, "battlegroup2")
                client.battlegroups.push(`${message.guild.id}`, targetb.id, "battlegroup2.members")
                client.battlegroups.set(`${message.guild.id}`, targetb.id, "battlegroup2.captain")
                knownbattlegroup = "battlegroup2"
            }
            else return message.channel.send("You are already at the maximum allowed amount of battlegroups!")
        }
        client.playersRolePrimeDB.set(`${targetb.id}`, "Captain", `role${knownbattlegroup}`)
        client.playersRolePrimeDB.set(`${targetb.id}`, `${targetb.id}`, "player")

        return message.channel.send("Battlegroup set!")
    }
}
