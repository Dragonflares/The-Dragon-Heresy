let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "setplayerbattleship",
    category: "hades' star",
    subcategory: "ship",
    description: "Sets the player's intended battleship for White Stars.",
    usage: "&setplayerbattleship, then asnwer the bot's questions. Don't state any levels unless asked for.",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set another player's battleship!")

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        
        let battleshipname
        let battleshiplevel
        let battleshipweapon
        let battleshipshield
        let battleshipsupport
        message.channel.send("Please name your battleship")
        try {
            battleshipname = await message.channel.awaitMessages(message2 => message2.content.length < 16 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship name, check if it's larger than 15 characters.");
        }

        message.channel.send("Please state your battleship's level")
        try {
            battleshiplevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 , {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship level.");
        }

        message.channel.send("Please state your battleship's weapon")
        try {
            battleshipweapon = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Weapons", {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship weapon.");
        }

        message.channel.send("Please state your battleship's shield")
        try {
            battleshipshield = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Shields", {
                maxMatches: 1,
                time: 40000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship shield.");
        }
       
        client.playersPrimeDB.set(`${message.author.id}`, `${battleshipname.first().content}`, `battleship.name`)

        client.playersPrimeDB.set(`${message.author.id}`, battleshiplevel.first().content , `battleship.level`)
        
        let techlevelwep = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${battleshipweapon.first().content}`)
        if(techlevelwep == 0) return message.channel.send("You don't have this weapon researched!")
        client.playersPrimeDB.set(`${message.author.id}`, `${battleshipweapon.first().content} ${techlevelwep}`, `battleship.weapon`)
 
        
        let techlevelshield = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${battleshipshield.first().content}`)
        if(techlevelshield == 0) return message.channel.send("You don't have this shield researched!")
        client.playersPrimeDB.set(`${message.author.id}`, `${battleshipshield.first().content} ${techlevelshield}`, `battleship.shield`)
        client.playersPrimeDB.set(`${message.author.id}`, [], `battleship.support`)
        if(parseInt(battleshiplevel.first().content) > 1) {
            message.channel.send("Please state your battleship's support modules, pressing enter between each of them")
            var i = 0
            for(i ; i < parseInt(battleshiplevel.first().content) - 1 ; i++) {
                try {
                    battleshipsupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                        maxMatches: 1,
                        time: 40000,
                        errors: ['time', 'name']
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Invalid battleship's support module.");
                }
                let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${battleshipsupport.first().content}`)
                if(techlevel == 0) return message.channel.send("You don't have this support module researched!")
                client.playersPrimeDB.push(`${message.author.id}`, `${battleshipsupport.first().content} ${techlevel}`, `battleship.support`)
            }
            return message.channel.send("Your battleship for white stars is now set.")
        }
        else {
            return message.channel.send("Your battleship for white stars is now set.")
        }


    }
}