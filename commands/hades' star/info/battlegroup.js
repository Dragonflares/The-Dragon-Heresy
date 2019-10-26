let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js").battlegroup

module.exports = {
    name: "createbattlegroup",
    category: "hades' star",
    subcategory: "info",
    description: "Creates a white star battlegroup and assigns it a captain.",
    usage: "&createbattlegroup <name> <captain>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must assign a captain to this battlegroup!")
        else targetb = message.guild.member(user)
        

    }
}
