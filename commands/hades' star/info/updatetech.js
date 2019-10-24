let TechData = require("../../../Database/Hades' Star/techs.json")

module.exports = {
    name: "updatetech",
    category: "hades' star",
    subcategory: "info",
    description: "Updates the level of a specific tech you own.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set another player's tech!")

        client.playersDB.ensure(`${targetb.id}`, {
            user: targetb.user.username,
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
        const tech = messagesplit[1]

        if(!tech) return message.channel.send(`Please specify the tech you want to update.`)

        if(!TechData[tech]) return message.channel.send(`There's no tech with said name!`)
        const techlevel = messagesplit[2] 

        if(!techlevel) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if((0 > techlevel) || Number(TechData[tech].Level[TechData[tech].Level.length - 1]) < (techlevel)) {
            return message.channel.send(`The level you gave is invalid for that tech!`)
        }
        client.playersDB.set(`${message.author.id}`, parseInt(techlevel, 10), `techs.${tech}`)
        return message.channel.send(`Tech level updated.`)
    }
}