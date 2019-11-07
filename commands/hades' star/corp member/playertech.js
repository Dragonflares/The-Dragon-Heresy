let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")

module.exports = {
    name: "playertech",
    aliases: ["ptech"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows the techs of a certain player in your corp.",
    usage: "&playertech (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))


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
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname1}`)
                        if(techlevel > 0) {
                            economytechs += `${techname1} ${techlevel}.\n`
                            foundeconomytech = 1
                        }
                    }
                }
                for(let techname2 in TechData) { 
                    if(TechData[techname2].Category === "Mining") {
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname2}`)
                        if(techlevel > 0) {
                            miningtechs += `${techname2} ${techlevel}.\n`
                            foundminingtech = 1
                        }
                    }
                }
                for(let techname3 in TechData) { 
                    if(TechData[techname3].Category === "Weapons") {
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname3}`)
                        if(techlevel > 0) {
                            weapontechs += `${techname3} ${techlevel}.\n`
                            foundweapontech = 1
                        }
                    }
                }
                for(let techname4 in TechData) { 
                    if(TechData[techname4].Category === "Shields") {
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname4}`)
                        if(techlevel > 0) {
                            shieldtechs += `${techname4} ${techlevel}.\n`
                            foundshieldtech = 1
                        }
                    }
                }
                for(let techname5 in TechData) { 
                    if(TechData[techname5].Category === "Support") {
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname5}`)
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
                        let techlevel = await client.playersPrimeDB.get(`${message.author.id}`, `techs.${techname}`)
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
            const playerguild = client.playersPrimeDB.get(`${member.id}`, `corp`)
            const authorguild = client.playersPrimeDB.get(`${message.author.id}`, `corp`)            
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
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname1}`)
                        if(techlevel > 0) {
                            economytechs += `${techname1} ${techlevel}.\n`
                            foundeconomytech = 1
                        }
                    }
                }
                for(let techname2 in TechData) { 
                    if(TechData[techname2].Category === "Mining") {
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname2}`)
                        if(techlevel > 0) {
                            miningtechs += `${techname2} ${techlevel}.\n`
                            foundminingtech = 1
                        }
                    }
                }
                for(let techname3 in TechData) { 
                    if(TechData[techname3].Category === "Weapons") {
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname3}`)
                        if(techlevel > 0) {
                            weapontechs += `${techname3} ${techlevel}.\n`
                            foundweapontech = 1
                        }
                    }
                }
                for(let techname4 in TechData) { 
                    if(TechData[techname4].Category === "Shields") {
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname4}`)
                        if(techlevel > 0) {
                            shieldtechs += `${techname4} ${techlevel}.\n`
                            foundshieldtech = 1
                        }
                    }
                }
                for(let techname5 in TechData) { 
                    if(TechData[techname5].Category === "Support") {
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname5}`)
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
                        let techlevel = await client.playersPrimeDB.get(`${user.id}`, `techs.${techname}`)
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