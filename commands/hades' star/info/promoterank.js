let TechData = require("../../../Database/Hades' Star/techs.json")

module.exports = {
    name: "promoterank",
    category: "hades' star",
    subcategory: "info",
    description: "Promotes a player in a Corp.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let member2 = message.guild.member(message.author)

        client.playersDB.ensure(`${message.author.id}`, {
            user: member2.user.username,
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

        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")
        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)
        if(!member) {
            let memberguild = client.playersDB.get(`${author.id}`, "corp")
            if(!(memberguild === message.guild.id)) return message.channel.send("You are not in your corp's server!")
            if(author.highestRole.hasPermission("ADMINISTRATOR")){
                let rank = client.playersDB.get(`${author.id}`, "rank")
                switch(rank){
                    case "Member": {
                        client.playersDB.set(`${author.id}`, "Senior Member", "rank")
                        break
                    }
                    case "Senior Member": {
                        client.playersDB.set(`${author.id}`, "Officer", "rank")
                        break
                    }
                    case "Officer": {
                        let guildmembers = message.guild.members
                        for(let member in guildmembers)
                        {
                            memberrank = client.playersDB.get(`${member.id}`, "rank")
                            if(memberrank === "First Officer"){
                                let membername = client.playersDB.get(`${member.id}`, "name")
                                return message.channel.send(`There's already a First Officer! It's ${membername}.`)
                            }
                        }
                        client.playersDB.set(`${author.id}`, "First Officer", "rank")
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
            let memberguild = client.playersDB.get(`${member.id}`, "corp")
            if(!(memberguild === message.guild.id)) return message.channel.send("You are not in your corp's server!")
            let memberrank = client.playersDB.get(`${member.id}`, "rank")
            let authorrank = client.playersDB.get(`${author.id}`, "rank")
            switch(authorrank){
                case "Officer": {
                    if(memberrank === "Officer") return message.channel.send("You can't promote another Officer!")
                    if(memberrank === "First Officer") return message.channel.send("You can't promote your First Officer beyond!")
                    if(memberrank === "Senior Member") {
                        client.playersDB.set(`${member.id}`, "Officer", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                    else {
                        client.playersDB.set(`${member.id}`, "Senior Member", "rank")
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
                            client.playersDB.set(`${member.id}`, "First Officer", "rank")
                            client.playersDB.set(`${author.id}`, "Officer", "rank")
                            return channel.message.send("You've succesfully promoted this person to First Officer. You have been demoted to Officer.")
                        }
                        if(response.first().content.toLowerCase() === "no") {
                            return channel.message.send("You are still our First Officer! Whew!")
                        }
                        else {
                            return message.channel.send("Invalid confirmation.");
                        }
                    }
                    if(memberrank === "Senior Member") {
                        client.playersDB.set(`${member.id}`, "Officer", "rank")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                    else {
                        client.playersDB.set(`${member.id}`, "Senior Member", "rank")
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