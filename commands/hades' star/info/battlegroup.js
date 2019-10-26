let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "createbattlegroup",
    category: "hades' star",
    subcategory: "info",
    description: "Creates a white star battlegroup.",
    usage: "&createbattlegroup <name>",
    run: async (client, message, args) => {
        let guildmembers = message.guild.members.values()
        for(let member of guildmembers) {
            client.playersPrimeDB.ensure(`${member.id}`, Player.player(member, message))
            let user = client.playersDB.get(`${member.id}`, "user")
            let rank = client.playersDB.get(`${member.id}`, "rank")
            let corp = client.playersDB.get(`${member.id}`, "corp")
            let timezone = client.playersDB.get(`${member.id}`, "timezone")
            let battleship = client.playersDB.get(`${member.id}`, "battleship")
            let techs = client.playersDB.get(`${member.id}`, "techs")

            client.playersPrimeDB.set(`${member.id}`, user, "name")
            client.playersPrimeDB.set(`${member.id}`, rank, "rank")
            client.playersPrimeDB.set(`${member.id}`, corp, "corp")
            client.playersPrimeDB.set(`${member.id}`, timezone, "timezone")
            client.playersPrimeDB.set(`${member.id}`, battleship, "battleship")
            client.playersPrimeDB.set(`${member.id}`, techs, "techs")

            message.channel.send(`${user} is already set in the new database`)
        }
    }
}
