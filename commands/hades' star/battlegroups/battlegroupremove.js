let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "deletebattlegroup",
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Deletes the named battlegroup.",
    usage: "&deletebattlegroup <battlegroupname>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        targetb = message.guild.member(message.author)

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.battlegroups.ensure(`${message.guild.id}`, Battlegroup.guildbattlegroup())

        let authorrank = client.playersPrimeDB.get(`${message.author.id}`, "rank")
        if(authorrank === "Officer" || authorrank === "First Officer"){}
        else return message.channel.send("You must be at least an Officer to delete a battlegroup!")

        let battlegroup1name = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
        let battlegroup2name = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")

        const messagesplit = message.content.split(" ")

        if(battlegroup1name === messagesplit[1]) {
            client.battlegroups.set(`${message.guild.id}`, "", "battlegroup1.name")
            let members = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.members")
            for(let member of members){
                client.playersRolePrimeDB.set(`${member}`, "", "rolebattlegroup1")
            }
            client.battlegroups.set(`${message.guild.id}`, [], "battlegroup1.members")
        }
        else if(battlegroup2name === messagesplit[1]) {
            client.battlegroups.set(`${message.guild.id}`, "", "battlegroup2.name")
            let members = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.members")
            for(let member of members){
                client.playersRolePrimeDB.set(`${member}`, "", "rolebattlegroup2")
            }
            client.battlegroups.set(`${message.guild.id}`, [], "battlegroup2.members")
        }
        else return message.channel.send("That's not a valid battlegroup name!")
        return message.channel.send("Battlegroup removed succesfully!")
    }
}