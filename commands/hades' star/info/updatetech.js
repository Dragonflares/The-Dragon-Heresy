let TechData = require("../../../Database/Hades' Star/techs.json")
let Player = require("../../../player.js")

module.exports = {
    name: "updatetech",
    category: "hades' star",
    subcategory: "info",
    description: "Updates the level of a specific tech you own.",
    usage: "&updatetech <tech>(no blank spaces) <level>",
    run: async (client, message, args) => {
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot set another player's tech!")

        client.playersPrimeDB.ensure(`${targetb.id}`, Player.player(targetb, message))

        const messagesplit = message.content.split(" ")
        const tech = messagesplit[1]

        if(!tech) return message.channel.send(`Please specify the tech you want to update.`)

        if(!TechData[tech]) return message.channel.send(`There's no tech with said name!`)
        const techlevel = messagesplit[2] 

        if(!techlevel) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if((0 > techlevel) || Number(TechData[tech].Level[TechData[tech].Level.length - 1]) < (techlevel)) {
            return message.channel.send(`The level you gave is invalid for that tech!`)
        }
        client.playersPrimeDB.set(`${message.author.id}`, parseInt(techlevel, 10), `techs.${tech}`)
        let techcategory = TechData[tech].Category

        if(techcategory === "Weapons") {
            let battleshiptech = client.playersPrimeDB.get(`${message.author.id}`, `battleship.weapon`)
            let techname = battleshiptech.split(" ")
            if(techname[0] === tech){
                client.playersPrimeDB.set(`${message.author.id}`, `${tech} ${techlevel}`, `battleship.weapon`)
            }
        }
        else if(techcategory === "Shields") {
            let battleshiptech = client.playersPrimeDB.get(`${message.author.id}`, `battleship.shield`)
            let techname = battleshiptech.split(" ")
            if(techname[0] === `${tech}`){
                client.playersPrimeDB.set(`${message.author.id}`, `${tech} ${techlevel}`, `battleship.shield`)
            }
        }
        else if(techcategory === "Support") {
            let battleshiptech = client.playersPrimeDB.get(`${message.author.id}`, `battleship.support`)
            for(let techb of battleshiptech){
                let techname = techb.split(" ")
                if(techname[0] === tech){
                    client.playersPrimeDB.remove(`${message.author.id}`, `${techb}`, `battleship.support`)
                    client.playersPrimeDB.push(`${message.author.id}`, `${tech} ${techlevel}`, `battleship.support`)
                }
            }
        }
        return message.channel.send(`Tech level updated.`)
    }
}