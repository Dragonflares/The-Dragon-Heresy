let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "setplayertransport",
    aliases: ["settp"],
    category: "hades' star",
    subcategory: "ship",
    description: "Sets the player's intended transport for White Stars.",
    usage: "&setplayertransport, then asnwer the bot's questions. Don't state any levels unless asked for.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set another player's transport!")

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        
        let transportname
        let transportlevel
        let transporteconomy
        let transportsupport
        message.channel.send("Please name your transport")
        try {
            transportname = await message.channel.awaitMessages(message2 => message2.content.length < 16 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid transport name, check if it's larger than 15 characters.");
        }

        message.channel.send("Please state your transport's level")
        try {
            transportlevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid transport level.");
        }
        client.playersPrimeDB.set(`${message.author.id}`, `${transportname.first().content}`, `transport.name`)

        client.playersPrimeDB.set(`${message.author.id}`, transportlevel.first().content , `transport.level`)
        
        client.playersPrimeDB.set(`${message.author.id}`,  [] , `transport.economy`)
        message.channel.send("Please state your transport's economy modules, pressing enter between each of them.")
        var i = 0
        for(i ; i < (parseInt(transportlevel.first().content)) ; i++) {
            try {
                transporteconomy = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Economy", {
                    maxMatches: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid transport's economy module.");
            }
            let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${transporteconomy.first().content}`)
            if(techlevel == 0) return message.channel.send("You don't have this economy module researched!")
            client.playersPrimeDB.push(`${message.author.id}`, `${transporteconomy.first().content} ${techlevel}`, `transport.economy`)
        }
        if(parseInt(transportlevel.first().content) > 2) {
            message.channel.send("Please state your transport's support module")
            try {
                transportsupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                    maxMatches: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid transport's support module.");
            }
            let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${transportsupport.first().content}`)
            if(techlevel == 0) return message.channel.send("You don't have this support module researched!")
            client.playersPrimeDB.set(`${message.author.id}`, `${transportsupport.first().content} ${techlevel}`, `transport.support`)
            return message.channel.send("Your transport for white stars is now set.")
        }
        else {
            return message.channel.send("Your transport for white stars is now set.")
        }


    }
}