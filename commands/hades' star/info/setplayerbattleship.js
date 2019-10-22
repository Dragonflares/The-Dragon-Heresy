let TechData = require("../../../Database/Hades' Star/techs.json")

module.exports = {
    name: "setplayerbattleship",
    category: "hades' star",
    subcategory: "info",
    description: "Sets the player's intended battleship for White Stars.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let member = message.guild.member(message.author)

        client.playersDB.ensure(`${message.author.id}`, {
            user: member.user.username,
            rank: 'Member',
            corp: `${message.guild.id}`,
            timezone: '+0',
            battleship: {
                name: "",
                level: 1,
                weapon: "",
                shield: "",
                support: []
            },
            techs: {
                CargoBayExtension: 0,
                ShipmentComputer: 0,
                TradeBoost: 0,
                Rush: 0,
                TradeBurst: 0,
                ShipmentDrone: 0,
                Offload: 0,
                ShipmentBeam: 0,
                Entrust: 0,
                Dispatch: 0,
                Recall: 0,
                MiningBoost: 0,
                HydrogenBayExtension: 0,
                Enrich: 0,
                RemoteMining: 0,
                HydrogenUpload: 0,
                MiningUnity: 0,
                Crunch: 0,
                Genesis: 0,
                HydrogenRocket: 0,
                MiningDrone: 0,
                WeakBattery: 0,
                Battery: 0,
                Laser: 0,
                MassBattery: 0,
                DualLaser: 0,
                Barrage: 0,
                DartLauncher: 0,
                AlphaShield: 0,
                DeltaShield: 0,
                PassiveShield: 0,
                OmegaShield: 0,
                MirrorShield: 0,
                BlastShield: 0,
                AreaShield: 0,
                EMP: 0,
                Teleport: 0,
                RedStarLifeExtender: 0,
                RemoteRepair: 0,
                TimeWarp: 0,
                Unity: 0,
                Sanctuary: 0,
                Stealth: 0,
                Fortify: 0,
                Impulse: 0,
                AlphaRocket: 0,
                Salvage: 0,
                Suppress: 0,
                Destiny: 0,
                Barrier: 0,
                Vengeance: 0,
                DeltaRocket: 0,
                Leap: 0,
                Bond: 0,
                AlphaDrone: 0,
                Suspend: 0,
                OmegaRocket: 0
            }
        })

        
        let battleshipname
        let battleshiplevel
        let battleshipweapon
        let battleshipshield
        let battleshipsupport
        message.channel.send("Please name your battleship")
        try {
            battleshipname = await message.channel.awaitMessages(message2 => message2.content.length < 16 , {
                maxMatches: 1,
                time: 20000,
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
                time: 20000,
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
                time: 20000,
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
                time: 20000,
                errors: ['time', 'name']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid battleship shield.");
        }
       
        client.playersDB.set(`${message.author.id}`, `${battleshipname.first().content}`, `battleship.name`)

        client.playersDB.set(`${message.author.id}`, battleshiplevel.first().content , `battleship.level`)
        
        let techlevelwep = await client.playersDB.get(`${message.author.id}`, `techs.${battleshipweapon.first().content}`)
        if(techlevelwep == 0) return message.channel.send("You don't have this weapon researched!")
        client.playersDB.set(`${message.author.id}`, `${battleshipweapon.first().content} ${techlevelwep}`, `battleship.weapon`)
 
        
        let techlevelshield = await client.playersDB.get(`${message.author.id}`, `techs.${battleshipshield.first().content}`)
        if(techlevelshield == 0) return message.channel.send("You don't have this shield researched!")
        client.playersDB.set(`${message.author.id}`, `${battleshipshield.first().content} ${techlevelshield}`, `battleship.shield`)
        
        if(parseInt(battleshiplevel.first().content) > 1) {
            message.channel.send("Please state your battleship's support modules, pressing enter between each of them")
            var i = 0
            for(i ; i < parseInt(battleshiplevel.first().content) - 1 ; i++) {
                try {
                    battleshipsupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                        maxMatches: 1,
                        time: 20000,
                        errors: ['time', 'name']
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send("Invalid battleship's support module.");
                }
                let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${battleshipsupport.first().content}`)
                if(techlevel == 0) return message.channel.send("You don't have this support module researched!")
                client.playersDB.push(`${message.author.id}`, `${battleshipsupport.first().content} ${techlevel}`, `battleship.support`)
            }
            return message.channel.send("Your battleship for white stars is now set.")
        }
        else {
            return message.channel.send("Your battleship for white stars is now set.")
        }


    }
}