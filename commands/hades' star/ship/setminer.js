let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "setplayerminer",
    category: "hades' star",
    subcategory: "ship",
    description: "Sets the player's intended miner for White Stars.",
    usage: "&setplayerminer, then answer the bot's questions. Don't state any levels unless asked for.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set another player's miner!")

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        
        let minername
        let minerlevel
        let minermining
        let minersupport
        message.channel.send("Please name your miner")
        try {
            minername = await message.channel.awaitMessages(message2 => message2.content.length < 16 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner name, check if it's larger than 15 characters.");
        }

        message.channel.send("Please state your miner's level")
        try {
            minerlevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner level.");
        }
        client.playersPrimeDB.set(`${message.author.id}`, `${minername.first().content}`, `miner.name`)

        client.playersPrimeDB.set(`${message.author.id}`, minerlevel.first().content , `miner.level`)
        
        if(parseInt(minerlevel.first().content) > 1) {
            message.channel.send("Please state your miner's support module")
            try {
                minersupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                    maxMatches: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid miner's support module.");
            }
            let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${minersupport.first().content}`)
            if(techlevel == 0) return message.channel.send("You don't have this support module researched!")
            client.playersPrimeDB.set(`${message.author.id}`, `${minersupport.first().content} ${techlevel}`, `miner.support`)

            message.channel.send("Please state your miner's mining modules, pressing enter between each of them.")
            var i = 0
            client.playersPrimeDB.set(`${message.author.id}`, [], `miner.mining`)
            for(i ; i < parseInt(minerlevel.first().content) - 1 ; i++) {
                try {
                    minermining = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Mining", {
                        maxMatches: 1,
                        time: 40000,
                        errors: ['time', 'name']
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Invalid miner's mining modules.");
                }
                let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${minermining.first().content}`)
                if(techlevel == 0) return message.channel.send("You don't have this mining module researched!")
                client.playersPrimeDB.push(`${message.author.id}`, `${minermining.first().content} ${techlevel}`, `miner.mining`)
            }
            return message.channel.send("Your miner for white stars is now set.")
        }
        else {
            return message.channel.send("Your miner for white stars is now set.")
        }


    }
}