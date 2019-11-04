let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")

module.exports = {
    name: "battlegroupaddplayer",
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Add's a player to a white star battlegroup.",
    usage: "&battlegroupaddplayer <battlegroupname> <role> <member>",
    run: async (client, message, args) => {
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) targetb = message.guild.member(message.author)
        else targetb = message.guild.member(user)

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))
        client.playersRolePrimeDB.ensure(`${targetb.id}`, Battlegroup.battlegroupMember())

        let authorrank = client.playersPrimeDB.get(`${message.author.id}`, "rank")
        if(authorrank === "Officer" || authorrank ==="First Officer"){}
        else return message.channel.send("You must be at least an Officer to add someone to a battlegroup!")

        let battlegroup1 = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
        let battlegroup1members = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.members")
        let battlegroup2 = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
        let battlegroup2members =client.battlegroups.get(`${message.guild.id}`, "battlegroup2.members")
        if(!battlegroup1) return message.channel.send("You have no battlegroups!")


        const messagesplit = message.content.split(" ")
        if(!messagesplit[1]) return message.channel.send("You must specify a battlegroup name!")
        let knownbattlegroup
        if(battlegroup1 === messagesplit[1]) {
            if(battlegroup1members.length === 15){
                return message.channel.send("This battlegroup is already at the max amount of members!")
            }
            knownbattlegroup = "battlegroup1"
        }
        else if(battlegroup2 === messagesplit[1]) {
            if(battlegroup2members.length === 15){
                return message.channel.send("This battlegroup is already at the max amount of members!")
            }
            knownbattlegroup = "battlegroup2"
        }
        else return message.channel.send("There's no battlegroup with this name in the corp!")
        if(!messagesplit[2] || (messagesplit[2].indexOf("<@") > -1)) return message.channel.send("You must specify a category for this member!")
        if(messagesplit[2].toLowerCase() === "captain") {
            message.channel.send(`Are you sure you want to set ${targetb.user.username} as the new captain? Yes/No`)
            let response
            try {
                response = await message.channel.awaitMessages(message2 => message2.content.length < 4 , {
                    maxMatches: 1,
                    time: 30000,
                    errors: ['time', 'length']
                });
            }
            catch (err) {
                console.error(err);
                return message.channel.send("Invalid confirmation.");
            }
            if(response.first().content.toLowerCase() === "yes") {
                message.channel.send("Which new role do you wish to give to the previous captain?")
                let response2
                try {
                    response2 = await message.channel.awaitMessages(message2 => message2.content.length < 50 , {
                        maxMatches: 1,
                        time: 30000,
                        errors: ['time', 'length']
                    });
                }
                catch (err) {
                    console.error(err);
                    return message.channel.send("Aborting captain change.");
                }
                if(response2.first().content == "Captain") return message.channel.send("Nice joke, you cannot set him as Captain again to make a loop. Aborting process.")
                client.playersRolePrimeDB.set(`${client.battlegroups.get(`${message.guild.id}`, `${knownbattlegroup}.captain`)}`, `${response2.first().content}`, `role${knownbattlegroup}`)
                client.battlegroups.set(`${message.guild.id}`, targetb.id, `${knownbattlegroup}.captain`)

                
            }
            else if(response.first().content.toLowerCase() === "no") {
                return message.channel.send("Well! Seems like our captain remains the same!")
            }
            else {
                return message.channel.send("Invalid confirmation.");
            }
        }
        let playersfound = client.battlegroups.get(`${message.guild.id}`, `${knownbattlegroup}.members`)
        if(playersfound.indexOf(targetb.id) < 0) {
            client.battlegroups.push(`${message.guild.id}`, targetb.id, `${knownbattlegroup}.members`)
        }
        
        let playerrole = client.playersRolePrimeDB.get(`${targetb.id}`, `role${knownbattlegroup}`)
        if(!playerrole) {
            client.playersRolePrimeDB.set(`${targetb.id}`, `${messagesplit[2]}`, `role${knownbattlegroup}`)
            client.playersRolePrimeDB.set(`${targetb.id}`, `${targetb.id}`, "player")
        }
        else if(playerrole.toLowerCase() === "captain"){
            return message.channel.send("You cannot change the captain's role without setting another Captain first!")
        }
        else {
            client.playersRolePrimeDB.set(`${targetb.id}`, `${messagesplit[2]}`, `role${knownbattlegroup}`)
            client.playersRolePrimeDB.set(`${targetb.id}`, `${targetb.id}`, "player")
        }
        return message.channel.send("A member has been added to this battlegroup!")
    }
}