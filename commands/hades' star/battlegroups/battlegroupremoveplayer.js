let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "battlegroupremovemember",
    aliases: ["bgrem"],
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Removes a player from a white star battlegroup.",
    usage: "&battlegroupremovemember <battlegroupname> <member>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must specify who you are kicking!.")
        else targetb = message.guild.member(user)

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.playersRolePrimeDB.ensure(`${targetb.id}`, Battlegroup.battlegroupMember())

        let battlegroup1 = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
        let battlegroup2 = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
        if(!battlegroup1) return message.channel.send("You have no battlegroups!")


        const messagesplit = message.content.split(" ")
        if(!messagesplit[1]) return message.channel.send("You must specify a battlegroup name!")
        let knownbattlegroup
        if(battlegroup1 === messagesplit[1]) {
            knownbattlegroup = "battlegroup1"
        }
        else if(battlegroup2 === messagesplit[1]) {
            knownbattlegroup = "battlegroup2"
        }
        else return message.channel.send("There's no battlegroup with this name in the corp!")

        let authorrole = client.playersRolePrimeDB.get(`${message.author.id}`, `role${knownbattlegroup}`)
        let authorrank = client.playerDB.get(`${message.author.id}`, "rank")
        if(authorrank === "Officer" || authorrank ==="First Officer" || authorrole === "Captain"){}
        else return message.channel.send("You must be at least an Officer or this group's Captain to remove someone from this battlegroup!")
        
        let battlegroupmembers = client.battlegroups.get(`${message.guild.id}`, `${knownbattlegroup}.members`)
        if(battlegroupmembers.includes(targetb.id)){
            let playerrole = client.playersRolePrimeDB.get(`${targetb.id}`, `role${knownbattlegroup}`)
            if(playerrole.toLowerCase() === "captain"){
                return message.channel.send("You cannot kick the captain of this battlegroup without setting another Captain first!")
            }
            client.playersRolePrimeDB.set(`${targetb.id}`, "", `role${knownbattlegroup}`)
            client.battlegroups.remove(`${message.guild.id}`, `${targetb.id}`, `${knownbattlegroup}.members`)
            return message.channel.send(`I've succesfully removed this player from ${messagesplit[1]}`)
        }
        else {
            return message.channel.send(`${user}does not belong to ${messagesplit[1]}!`)
        }
    }
}