let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")

module.exports = {
    name: "playertech",
    category: "hades' star",
    subcategory: "info",
    description: "Shows the techs of a certain player in your corp.",
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

        const messagesplit = message.content.split(" ")
        let ProfileEmbed = new RichEmbed().setColor("RANDOM")
        const user = message.mentions.users.first()
        if(!user){
            const member = message.guild.member(message.author);
            ProfileEmbed.setTitle(`**Player: ${member.nickname} **`)
            if(!messagesplit[1]){
                let economytechs = ""
                let weapontechs = ""
                let miningtechs = ""
                let shieldtechs = ""
                let supporttechs = ""
                let foundweapontech= 0 
                let foundeconomytech= 0 
                let foundminingtech= 0 
                let foundshieldtech = 0
                let foundsupporttech = 0
                for(let techname1 in TechData){ 
                    if(TechData[techname1].Category === "Economy") {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname1}`)
                        if(techlevel > 0) {
                            economytechs += `${techname1} ${techlevel}.\n`
                            foundeconomytech = 1
                        }
                    }
                }
                for(let techname2 in TechData) { 
                    if(TechData[techname2].Category === "Mining") {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname2}`)
                        if(techlevel > 0) {
                            miningtechs += `${techname2} ${techlevel}.\n`
                            foundminingtech = 1
                        }
                    }
                }
                for(let techname3 in TechData) { 
                    if(TechData[techname3].Category === "Weapons") {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname3}`)
                        if(techlevel > 0) {
                            weapontechs += `${techname3} ${techlevel}.\n`
                            foundweapontech = 1
                        }
                    }
                }
                for(let techname4 in TechData) { 
                    if(TechData[techname4].Category === "Shields") {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname4}`)
                        if(techlevel > 0) {
                            shieldtechs += `${techname4} ${techlevel}.\n`
                            foundshieldtech = 1
                        }
                    }
                }
                for(let techname5 in TechData) { 
                    if(TechData[techname5].Category === "Support") {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname5}`)
                        if(techlevel > 0) {
                            supporttechs += `${techname5} ${techlevel}.\n`
                            foundsupporttech = 1
                        }
                    }
                }
                
                if(foundeconomytech) ProfileEmbed.addField("*Economy*", `${economytechs}`)
                if(foundminingtech) ProfileEmbed.addField("*Mining*", `${miningtechs}`)
                if(foundweapontech) ProfileEmbed.addField("*Weapons*", `${weapontechs}`)
                if(foundshieldtech) ProfileEmbed.addField("*Shields*", `${shieldtechs}`)
                if(foundsupporttech) ProfileEmbed.addField("*Support*", `${supporttechs}`)

                if(foundeconomytech == 0 && foundminingtech == 0 && foundweapontech == 0 && foundshieldtech == 0 && foundsupporttech == 0){
                    ProfileEmbed.setDescription("No techs found!")
                }
            }
            else {
                let foundtech = 0
                let techs = ""
                let category
                for(let techname in TechData){ 
                    if(TechData[techname].Category === messagesplit[1]) {
                        let techlevel = await client.playersDB.get(`${message.author.id}`, `techs.${techname}`)
                        if(techlevel > 0) {
                            techs += `${techname} ${techlevel}.\n`
                            if(!foundtech) {
                                category = TechData[techname].Category
                            }
                            foundtech = 1
                        }
                    }
                }
                if(!foundtech) ProfileEmbed.setDescription("No techs were found!")
                else {
                    ProfileEmbed.addField(`*${category}*`, `${techs}`)
                }
            }
            return message.channel.send(ProfileEmbed)
        }
        else {

            const member = message.guild.member(user);
            const playerguild = client.playersDB.get(`${member.id}`, `corp`)
            const authorguild = client.playersDB.get(`${message.author.id}`, `corp`)            
            if(!(playerguild === authorguild)) return message.channel.send("You don't belong to the corp this player is at!")
            ProfileEmbed.setTitle(`**Player: ${member.nickname} **`)
            if(!messagesplit[2]){
                let economytechs = ""
                let weapontechs = ""
                let miningtechs = ""
                let shieldtechs = ""
                let supporttechs = ""
    
                let foundweapontech= 0 
                let foundeconomytech= 0 
                let foundminingtech= 0 
                let foundshieldtech = 0
                let foundsupporttech = 0
                for(let techname1 in TechData){ 
                    if(TechData[techname1].Category === "Economy") {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname1}`)
                        if(techlevel > 0) {
                            economytechs += `${techname1} ${techlevel}.\n`
                            foundeconomytech = 1
                        }
                    }
                }
                for(let techname2 in TechData) { 
                    if(TechData[techname2].Category === "Mining") {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname2}`)
                        if(techlevel > 0) {
                            miningtechs += `${techname2} ${techlevel}.\n`
                            foundminingtech = 1
                        }
                    }
                }
                for(let techname3 in TechData) { 
                    if(TechData[techname3].Category === "Weapons") {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname3}`)
                        if(techlevel > 0) {
                            weapontechs += `${techname3} ${techlevel}.\n`
                            foundweapontech = 1
                        }
                    }
                }
                for(let techname4 in TechData) { 
                    if(TechData[techname4].Category === "Shields") {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname4}`)
                        if(techlevel > 0) {
                            shieldtechs += `${techname4} ${techlevel}.\n`
                            foundshieldtech = 1
                        }
                    }
                }
                for(let techname5 in TechData) { 
                    if(TechData[techname5].Category === "Support") {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname5}`)
                        if(techlevel > 0) {
                            supporttechs += `${techname5} ${techlevel}.\n`
                            foundsupporttech = 1
                        }
                    }
                }
                
                if(foundeconomytech) ProfileEmbed.addField("*Economy*", `${economytechs}`)
                if(foundminingtech) ProfileEmbed.addField("*Mining*", `${miningtechs}`)
                if(foundweapontech) ProfileEmbed.addField("*Weapons*", `${weapontechs}`)
                if(foundshieldtech) ProfileEmbed.addField("*Shields*", `${shieldtechs}`)
                if(foundsupporttech) ProfileEmbed.addField("*Support*", `${supporttechs}`)

                if(foundeconomytech == 0 && foundminingtech ==0 && foundweapontech == 0 && foundshieldtech == 0 && foundsupporttech == 0){
                    ProfileEmbed.setDescription("No techs found!")
                }
            }
            else {
                let foundtech = 0
                let techs = ""
                for(let techname in TechData){ 
                    if(TechData[techname].Category === messagesplit[2]) {
                        let techlevel = await client.playersDB.get(`${user.id}`, `techs.${techname}`)
                        if(techlevel > 0) {
                            techs += `${techname} ${techlevel}.\n`
                            if(!foundtech) {
                                category = TechData[techname].Category
                            }
                            foundtech = 1
                        }
                    }
                }
                if(!foundtech) ProfileEmbed.setDescription("No techs were found!")
                else {
                    ProfileEmbed.addField(`*${category}*`, `${techs}`)
                }
            }
            return message.channel.send(ProfileEmbed)
        }
    }
}