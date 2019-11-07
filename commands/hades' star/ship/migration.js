let TechData = require("../../../Database/Hades' Star/techs.json") 
let { RichEmbed } = require("discord.js") 
let Player = require("../../../player.js") 
 
module.exports = { 
    name: "migrate", 
    category: "hades' star", 
    subcategory: "ship", 
    description: "Creates a white star battlegroup.", 
    usage: "&createbattlegroup <name>", 
    run: async (client, message, args) => { 
        let guildmembers = message.guild.members.values() 
        for(let member of guildmembers) { 
            await client.playersPrimeDB.ensure(`${member.id}`, Player.player(member, message)) 
            await client.playerDB.ensure(`${member.id}`, Player.player(member, message)) 
            let user = client.playerDB.get(`${member.id}`, "user") 
            let rank = client.playersPrimeDB.get(`${member.id}`, "rank") 
            let corp = client.playersPrimeDB.get(`${member.id}`, "corp") 
            let timezone = client.playersPrimeD.get(`${member.id}`, "timezone") 
            let battleship = client.playersPrimeDB.get(`${member.id}`, "battleship") 
            let techs = client.playersPrimeDB.get(`${member.id}`, "techs") 
            let miner = client.playersPrimeDB.get(`${member.id}`, "miner") 
            let transport = client.playersPrimeDB.get(`${member.id}`, "transport") 
 
            client.playerDB.set(`${member.id}`, user, "name") 
            client.playerDB.set(`${member.id}`, rank, "rank") 
            client.playerDB.set(`${member.id}`, corp, "corp") 
            client.playerDB.set(`${member.id}`, timezone, "timezone") 
            client.playerDB.set(`${member.id}`, battleship, "battleship") 
            client.playerDB.set(`${member.id}`, techs, "techs") 
            client.playerDB.set(`${member.id}`, miner, "miner") 
            client.playerDB.set(`${member.id}`, transport, "transport") 
 
            message.channel.send(`${user} is already set in the new database`) 
        } 
    } 
} 