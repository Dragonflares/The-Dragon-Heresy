let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")
const { registerFont, Canvas} = require('canvas');
const TheCanvas = require('canvas')
const { Attachment } = require('discord.js');

module.exports = {
    name: "listbattlegroup",
    category: "hades' star",
    subcategory: "battlegroups",
    description: "Show's this guild's battlegroups.",
    usage: "&listbattlegroup (battlegroupname), no stating the name will show which battlegroups you've set",
    run: async (client, message, args) => {
        let battlegroupEmbed = new RichEmbed().setColor("RANDOM")
        client.battlegroups.ensure(`${message.guild.id}`, Battlegroup.guildbattlegroup())

        let messagesplit = message.content.split(" ")
        if(!messagesplit[1]) {
            battlegroupEmbed.setTitle("**Battlegroups**")
            battlegroupEmbed.setFooter("You can specify a battlegroup name and get a detailed composition of the team")
            if(message.mentions.users > 0) return message.channel.send("You can't mention a user for this command.")
            let battlegroup1name = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
            let battlegroup1captain = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.captain")
            let battlegroup2name = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
            let battlegroup2captain = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.captain")

            if(!battlegroup1name) {
                if(!battlegroup2name){
                    return message.channel.send("There are no Battlegroups set in this Corp!")
                }
                else{
                    battlegroupEmbed.addField(`*${battlegroup2name}*`, `Captain: ${client.playersPrimeDB.get(`${battlegroup2captain}`, "name")}`)
                }
            }
            else {
                if(!battlegroup2name){
                    battlegroupEmbed.addField(`*${battlegroup1name}*`, `Captain: ${client.playersPrimeDB.get(`${battlegroup1captain}`, "name")}`)
                }
                else {
                    battlegroupEmbed.addField(`*${battlegroup2name}*`, `Captain: ${client.playersPrimeDB.get(`${battlegroup2captain}`, "name")}`)
                    battlegroupEmbed.addField(`*${battlegroup1name}*`, `Captain: ${client.playersPrimeDB.get(`${battlegroup1captain}`, "name")}`)
                }
            }
            return message.channel.send(battlegroupEmbed)
        }
        else {

            let battlegroup1name = client.battlegroups.get(`${message.guild.id}`, "battlegroup1.name")
            let battlegroup2name = client.battlegroups.get(`${message.guild.id}`, "battlegroup2.name")
            let targetbattlegroup
            if(battlegroup1name === messagesplit[1]) targetbattlegroup = "battlegroup1"
            else if(battlegroup2name === messagesplit[1]) targetbattlegroup = "battlegroup2"
            else return message.channel.send("There's no battlegroup with this name in the corp!")

            let battlegroupmembers = client.battlegroups.get(`${message.guild.id}`, `${targetbattlegroup}.members`)
            if(battlegroupmembers.length < 5) return message.channel.send("There are not enough members in this battlegroup for a white star yet!")
            
            const buffer = await roster(message, client, targetbattlegroup);
            const filename = `battlegroup-${messagesplit[1]}.jpg`;
            const attachment = new Attachment(buffer, filename);
            await message.channel.send(attachment);
                

        }
    }
}

async function roster(message, client, battlegroup) {
    let guildmembers = message.guild.members
    let battlegroupmembers = client.battlegroups.get(`${message.guild.id}`, `${battlegroup}.members`)
    let battlegroupcaptain = client.battlegroups.get(`${message.guild.id}`, `${battlegroup}.captain`)
    
    const foxCavalier = './fonts/Fox_Cavalier.otf'
    const batmanfont = "./fonts/batman_forever/batmfa__.ttf"
    const bignoodle = './fonts/bignoodletitling/big_noodle_titling.ttf'
    const raidercrusader = './fonts/raider-crusader/raidercrusader.ttf'
    const krazyhazy = './fonts/krazy-hazy/KrazyHazy.otf'
    registerFont(batmanfont, {family: 'BatmanFonts'})
    registerFont(foxCavalier, {family: 'FoxCavalier'})
    registerFont(bignoodle, {family: "Noodle"})
    registerFont(raidercrusader, {family: "Crusader"})
    registerFont(krazyhazy, {family: "Hazy"})

    const rosterImage = new Canvas(1700, 900 * (Math.trunc((battlegroupmembers.length / 5) + 0.8)) )
    const roster = rosterImage.getContext('2d')
    const background = await TheCanvas.loadImage('./canvas/hadesbackground1.jpg')
    roster.drawImage(background, 0, 0, rosterImage.width, rosterImage.height)
    
    
    let captainname = client.playersPrimeDB.get(`${battlegroupcaptain}`, 'name')
    let captainbattleship = client.playersPrimeDB.get(`${battlegroupcaptain}`, 'battleship')
    let captainsupport = client.playersRole.get(`${battlegroupcaptain}`, 'support')
    let captainsupportship
    if(captainsupport.toLowerCase() === "transport") {
        captainsupportship = client.playersPrimeDB.get(`${battlegroupcaptain}`, 'transport')
    }
    else if(captainsupport.toLowerCase() === "miner"){
        captainsupportship = client.playersPrimeDB.get(`${battlegroupcaptain}`, 'miner')
    }
    roster.globalAlpha = 0.5
    roster.fillStyle = "black"
    roster.fillRect(100, 50, 275, 800)
    roster.globalAlpha = 1
    roster.fillStyle = '#fff400'
    roster.font = '40px "Crusader"'
    roster.fillText(`${captainname}`, '110', '65')
    roster.font = '28px "Crusader"'
    roster.fillText(`Role: Captain`, '110', '110')
    roster.font = '20px "Crusader"'
    roster.fillText(`Battleship`, '110', '145')
    const captainbattleshipimage = await TheCanvas.loadImage(`./canvas/Battleship${captainbattleship.level}.png`)
    
    roster.drawImage(captainbattleshipimage, 110, 175, 100, 240)

    roster.strokeStyle = '#fff400'
    roster.beginPath()
    roster.lineWidth = 4
    roster.moveTo(160, 235)
    roster.lineTo(230, 235)

    roster.font = '20px "Crusader"'
    roster.fillText(`${captainbattleship.weapon}`, '235', '240')

    roster.moveTo(160, 295)
    roster.lineTo(230, 295)

    roster.fillText(`${captainbattleship.shield}`, '235', '300')

    roster.moveTo(160, 355)
    roster.lineTo(230, 355)
    let supportnumber = 0
    for(let support of captainbattleship.support) {
        let position = 360 + 20 * supportnumber
        roster.fillText(`${support}`, '235', `${position}`)
        supportnumber++
    }

    roster.closePath()
    roster.stroke()

    return rosterImage.toBuffer();

}