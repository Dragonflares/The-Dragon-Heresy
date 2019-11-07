let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "promote",
    aliases: ["prom"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Promotes a player in a Corp.",
    usage: "&promote <member>.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(user)

        client.playerDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        const messagesplit = message.content.split(" ")

        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")
        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)
        if(!member) {
            let memberguild = client.playerDB.get(`${author.id}`, "corp")
            if(!(memberguild === message.guild.id)) return message.channel.send("You are not in your corp's server!")
            if(author.highestRole.hasPermission("ADMINISTRATOR")){
                let rank = client.playerDB.get(`${author.id}`, "rank")
                switch(rank){
                    case "Member": {
                        client.playerDB.set(`${author.id}`, "Senior Member", "rank")
                        break
                    }
                    case "Senior Member": {
                        client.playerDB.set(`${author.id}`, "Officer", "rank")
                        break
                    }
                    case "Officer": {
                        let guildmembers = message.guild.members.values()
                        for(let member of guildmembers)
                        {
                            client.playerDB.ensure(`${member.id}`, Player.player(member, message))
                            client.playerDB.set(`${member.id}`, `${member.user.username}`, "name")
                            memberrank = client.playerDB.get(`${member.id}`, "rank")
                            if(memberrank === "First Officer"){
                                
                                let membername = client.playerDB.get(`${member.id}`, "name")
                                return message.channel.send(`There's already a First Officer! It's ${membername}.`)
                            }
                        }
                        client.playerDB.set(`${author.id}`, "First Officer", "rank")
                        break
                    }
                    case "First Officer": {
                        return message.channel.send("There's no rank above you!")
                    }
                }
                return message.channel.send("You've been promoted successfully!")
            }
            else return message.channel.send("You can't promote yourself!")
        }
        else {
            if(member.id === author.id) return message.channel.send("You can't mention yourself for promotion!")
            let memberguild = client.playerDB.get(`${member.id}`, "corp")
            if(!(memberguild === message.guild.id)) return message.channel.send("You are not in your corp's server!")
            let memberrank = client.playerDB.get(`${member.id}`, "rank")
            let authorrank = client.playerDB.get(`${author.id}`, "rank")
            switch(authorrank){
                case "Officer": {
                    if(memberrank === "Officer") return message.channel.send("You can't promote another Officer!")
                    if(memberrank === "First Officer") return message.channel.send("You can't promote your First Officer beyond!")
                    if(memberrank === "Senior Member") {
                        client.playerDB.set(`${member.id}`, "Officer", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                    else {
                        client.playerDB.set(`${member.id}`, "Senior Member", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                }
                case "First Officer": {
                    if(memberrank === "Officer") {
                        message.channel.send("Are you sure you want to promote this person to First Officer? Yes/No")
                        let response
                        try {
                            response = await message.channel.awaitMessages(message2 => message2.content.length < 4 , {
                                maxMatches: 1,
                                time: 20000,
                                errors: ['time', 'length']
                            });
                        }
                        catch (err) {
                            console.error(err);
                            return message.channel.send("Invalid confirmation.");
                        }
                        if(response.first().content.toLowerCase() === "yes") {
                            client.playerDB.set(`${member.id}`, "First Officer", "rank")
                            client.playerDB.set(`${author.id}`, "Officer", "rank")
                            return message.channel.send("You've succesfully promoted this person to First Officer. You have been demoted to Officer.")
                        }
                        if(response.first().content.toLowerCase() === "no") {
                            return message.channel.send("You are still our First Officer! Whew!")
                        }
                        else {
                            return message.channel.send("Invalid confirmation.");
                        }
                    }
                    if(memberrank === "Senior Member") {
                        client.playerDB.set(`${member.id}`, "Officer", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                    else {
                        client.playerDB.set(`${member.id}`, "Senior Member", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                }
                default: {
                    return message.channel.send("You must be an officer to promote someone!")
                }
            }
        }

    }
}