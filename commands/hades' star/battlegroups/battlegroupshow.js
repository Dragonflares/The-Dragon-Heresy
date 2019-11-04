let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
let Player = require("../../../player.js")
let Battlegroup = require("../../../battlegroup.js")
const { registerFont, Canvas} = require(`canvas`);
const TheCanvas = require(`canvas`)
const { Attachment } = require(`discord.js`);

module.exports = {
    name: "listbattlegroup",
    category: "hades` star",
    subcategory: "battlegroups",
    description: "Show`s this guild`s battlegroups.",
    usage: "&listbattlegroup (battlegroupname), no stating the name will show which battlegroups you`ve set",
    run: async (client, message, args) => {
        let battlegroupEmbed = new RichEmbed().setColor("RANDOM")
        client.battlegroups.ensure(`${message.guild.id}`, Battlegroup.guildbattlegroup())

        let messagesplit = message.content.split(" ")
        if(!messagesplit[1]) {
            battlegroupEmbed.setTitle("**Battlegroups**")
            battlegroupEmbed.setFooter("You can specify a battlegroup name and get a detailed composition of the team")
            if(message.mentions.users > 0) return message.channel.send("You can`t mention a user for this command.")
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
            else return message.channel.send("There`s no battlegroup with this name in the corp!")
            let pages = 0
            let battlegroupmembers = client.battlegroups.get(`${message.guild.id}`, `${targetbattlegroup}.members`)
            if(battlegroupmembers.length < 5) return message.channel.send("There are not enough members in this battlegroup for a white star yet!")
            else if(battlegroupmembers.length < 10){
                pages = 2
                console.log(pages)
            }
            else if(battlegroupmembers.length < 15){
                pages = 3
                console.log(pages)
            }
            else if(battlegroupmembers.length === 15) {
                pages = 4
                console.log(pages)
            }
            let a = 1
            while(a < pages) {
                console.log(a)
                const buffer = await roster(message, client, targetbattlegroup, a);
                const filename = `battlegroup-${messagesplit[1]}-page-${a}.jpg`;
                const attachment = new Attachment(buffer, filename);
                await message.channel.send(attachment);
                a++
            }
                

        }
    }
}

async function roster(message, client, battlegroup, page) {
    let guildmembers = message.guild.members
    let battlegroupmembers = client.battlegroups.get(`${message.guild.id}`, `${battlegroup}.members`)
    let battlegroupcaptain = client.battlegroups.get(`${message.guild.id}`, `${battlegroup}.captain`)
    
    const foxCavalier = `./fonts/Fox_Cavalier.otf`
    const batmanfont = "./fonts/batman_forever/batmfa__.ttf"
    const bignoodle = `./fonts/bignoodletitling/big_noodle_titling.ttf`
    const raidercrusader = `./fonts/raider-crusader/raidercrusader.ttf`
    const krazyhazy = `./fonts/krazy-hazy/KrazyHazy.otf`
    registerFont(batmanfont, {family: `BatmanFonts`})
    registerFont(foxCavalier, {family: `FoxCavalier`})
    registerFont(bignoodle, {family: "Noodle"})
    registerFont(raidercrusader, {family: "Crusader"})
    registerFont(krazyhazy, {family: "Hazy"})

    const rosterImage = new Canvas(1725, 1050)
    const roster = rosterImage.getContext(`2d`)
    const background = await TheCanvas.loadImage(`./canvas/hadesbackground1.jpg`)
    roster.drawImage(background, 0, 0, rosterImage.width, rosterImage.height)
    
    
    let captainname = client.playersPrimeDB.get(`${battlegroupcaptain}`, `name`)
    let captainbattleship = client.playersPrimeDB.get(`${battlegroupcaptain}`, `battleship`)
    let captainsupport = client.playersRolePrimeDB.get(`${battlegroupcaptain}`, `support`)
    let captainsupportship
    roster.fillStyle = `#ffe803`
    roster.font = `20px "Crusader"`
    roster.fillText(`Page ${page}`, "839", "1025")
    let startingPoint
    if(page === 1) {
        startingPoint = 1
        roster.globalAlpha = 0.5
        roster.fillStyle = "black"
        roster.fillRect(75, 75, 275, 925)
        roster.globalAlpha = 1
        roster.fillStyle = `#ffe803`
        roster.font = `34px "Crusader"`
        wrapText(roster,captainname,105,95,275,34)
        roster.font = `28px "Crusader"`
        roster.strokeStyle = 'black'
        roster.lineWidth = 6
        roster.strokeText(`Role: Captain`, `105`, `200`)
        roster.fillText(`Role: Captain`, `105`, `200`)
        roster.font = `20px "Crusader"`
        roster.strokeStyle = 'black'
        roster.lineWidth = 6
        roster.strokeText(`Battleship`, `105`, `235`)
        roster.fillText(`Battleship`, `105`, `235`)
        const captainbattleshipimage = await TheCanvas.loadImage(`./canvas/Battleship${captainbattleship.level}.png`)
        
        roster.drawImage(captainbattleshipimage, 105, 265, 100, 240)

        roster.strokeStyle = `#ffe803`

        roster.lineWidth = 4
        roster.moveTo(135, 325)
        roster.lineTo(205, 325)

        roster.font = `20px "Crusader"`
        roster.strokeStyle = 'black'
        roster.lineWidth = 6
        roster.strokeText(`${captainbattleship.weapon}`, `210`, `330`)
        roster.fillText(`${captainbattleship.weapon}`, `210`, `330`)
        roster.strokeStyle = `#ffe803`

        roster.lineWidth = 4
        roster.moveTo(135, 385)
        roster.lineTo(205, 385)
        roster.strokeStyle = 'black'
        roster.lineWidth = 6
        roster.strokeText(`${captainbattleship.shield}`, `210`, `390`)
        roster.fillText(`${captainbattleship.shield}`, `210`, `390`)
        roster.strokeStyle = `#ffe803`

        roster.lineWidth = 4
        if(captainbattleship.level < 2) {}
        else {
            roster.moveTo(135, 445)
            roster.lineTo(205, 445)
            let supportnumber = 0
            for(let support of captainbattleship.support) {
                let position = 450 + 20 * supportnumber
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${support}`, `210`, `${position}`)
                roster.fillText(`${support}`, `210`, `${position}`)
                supportnumber++
            }
        }
        roster.strokeStyle = `#ffe803`

        roster.lineWidth = 4
        roster.stroke()
        if(captainsupport.toLowerCase() === "transport") {
            captainsupportship = client.playersPrimeDB.get(`${battlegroupcaptain}`, `transport`)
            roster.font = `17px "Crusader"`
            roster.strokeStyle = 'black'
            roster.lineWidth = 6
            roster.strokeText(`Transport`, `105`, `565`)
            roster.fillText(`Transport`, `105`, `565`)
            const captaintransportimage = await TheCanvas.loadImage(`./canvas/Transport${captainsupportship.level}.png`)
            roster.drawImage(captaintransportimage, 105, 590, 100, 140)
            roster.strokeStyle = `#ffe803`
            roster.lineWidth = 4
            roster.moveTo(135, 655)
            roster.lineTo(135, 595)
            roster.lineTo(205, 595)
            let economynumber = 0
            for(let economy of captainsupportship.economy) {
                let position = 560 + 20 * economynumber
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${economy}`, `210`, `${position}`)
                roster.fillText(`${economy}`, `210`, `${position}`)
                economynumber++
            }
            if(captainsupportship.level > 2 ) {
                roster.moveTo(135, 700)
                roster.lineTo(135, 760)
                roster.lineTo(150, 760)
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${captainsupportship.support}`, `155`, `765`)
                roster.fillText(`${captainsupportship.support}`, `155`, `765`)
            }
            roster.stroke()
        }
        else if(captainsupport.toLowerCase() === "miner"){
            captainsupportship = client.playersPrimeDB.get(`${battlegroupcaptain}`, `miner`)
            roster.font = `17px "Crusader"`
            roster.strokeStyle = 'black'
            roster.lineWidth = 6
            roster.strokeText(`Miner`, `105`, `565`)
            roster.fillText(`Miner`, `105`, `565`)
            const captainminerimage = await TheCanvas.loadImage(`./canvas/Miner${captainsupportship.level}.png`)
            roster.drawImage(captainminerimage, 105, 590, 100, 140)
            roster.strokeStyle = `#ffe803`
            roster.lineWidth = 4
            roster.moveTo(135, 655)
            roster.lineTo(135, 595)
            roster.lineTo(205, 595)
            let economynumber = 0
            for(let economy of captainsupportship.mining) {
                let position = 600 + 20 * economynumber
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${economy}`, `210`, `${position}`)
                roster.fillText(`${economy}`, `210`, `${position}`)
                economynumber++
            }
            if(captainsupportship.level > 2 ) {
                roster.strokeStyle = `#ffe803`
                roster.moveTo(135, 700)
                roster.lineTo(135, 760)
                roster.lineTo(150, 760)
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${captainsupportship.support}`, `155`, `765`)
                roster.fillText(`${captainsupportship.support}`, `155`, `765`)
            }
            roster.strokeStyle = 'ffe803'
            roster.stroke()
        }
        else if (captainsupport.toLowerCase() === "") {
            roster.fillText(`No support ship chosen`, `105`, `465`)
        }
    }
    else{
        startingPoint = 0
    }
    let membercounter = 0
    //100, 50, 275, 800
    for( let bgmember of battlegroupmembers){
        if(startingPoint < 5) {
            if(membercounter < (page-1)*5) {
                membercounter++ 
            }
            else if(bgmember === battlegroupcaptain){}
            else {
                roster.globalAlpha = 0.5
                roster.fillStyle = "black"
                roster.fillRect(75 + 325 * startingPoint, 75, 275, 925)

                let membername = client.playersPrimeDB.get(`${bgmember}`, `name`)
                let memberbattleship = client.playersPrimeDB.get(`${bgmember}`, `battleship`)
                let membersupport = client.playersRolePrimeDB.get(`${bgmember}`, `support`)
                let memberrole = client.playersRolePrimeDB.get(`${bgmember}`, `role${battlegroup}`)
                let membersupportship

                roster.globalAlpha = 1
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.fillStyle = `#ffe803`
                roster.font = `34px "Crusader"`
                wrapText(roster,membername,105+ 325 * startingPoint,95,275,34)
                roster.font = `28px "Crusader"`
                roster.strokeText(`Role: ${memberrole}`, `${105+ 325 * startingPoint}`, `200`);
                roster.fillText(`Role: ${memberrole}`, `${105+ 325 * startingPoint}`, `200`)
                roster.font = `20px "Crusader"`
                roster.strokeText(`Battleship`, `${105+ 325 * startingPoint}`, `235`)
                roster.fillText(`Battleship`, `${105+ 325 * startingPoint}`, `235`)
                const memberbattleshipimage = await TheCanvas.loadImage(`./canvas/Battleship${memberbattleship.level}.png`)
                
                roster.drawImage(memberbattleshipimage, 105+ 325 * startingPoint, 265, 100, 240)
            
                roster.strokeStyle = `#ffe803`
            
                roster.lineWidth = 4
                roster.moveTo(135 + 325 * startingPoint, 325)
                roster.lineTo(205 + 325 * startingPoint, 325)
            
                roster.font = `20px "Crusader"`
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${memberbattleship.weapon}`, `${210 + 325 * startingPoint}`, `330`)
                roster.fillText(`${memberbattleship.weapon}`, `${210 + 325 * startingPoint}`, `330`)
                roster.strokeStyle = `#ffe803`
            
                roster.lineWidth = 4
                roster.moveTo(135 + 325 * startingPoint, 385)
                roster.lineTo(205 + 325 * startingPoint, 385)
                roster.strokeStyle = 'black'
                roster.lineWidth = 6
                roster.strokeText(`${memberbattleship.shield}`, `${210 + 325 * startingPoint}`, `390`)
                roster.fillText(`${memberbattleship.shield}`, `${210 + 325 * startingPoint}`, `390`)

                roster.strokeStyle = `#ffe803`
                roster.lineWidth = 4
                if(memberbattleship.level < 2){}
                else {
                    roster.moveTo(135 + 325 * startingPoint, 445)
                    roster.lineTo(205 + 325 * startingPoint, 445)
                    let supportnumber = 0
                    for(let support of memberbattleship.support) {
                        let position = 450 + 20 * supportnumber
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 6
                        roster.strokeText(`${support}`, `${210 + 325 * startingPoint}`, `${position}`)
                        roster.fillText(`${support}`, `${210 + 325 * startingPoint}`, `${position}`)
                        supportnumber++
                    }
                }
                roster.strokeStyle = `#ffe803`
            
                roster.lineWidth = 4
                roster.stroke()
                if(membersupport.toLowerCase() === "transport") {
                    membersupportship = client.playersPrimeDB.get(`${bgmember}`, `transport`)
                    roster.font = `17px "Crusader"`
                    if(membersupportship.level === 0){
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 6
                        roster.strokeText(`Transport not set`, `${105 + 325 * startingPoint}`, `565`)
                        roster.fillText(`Transport not set`, `${105 + 325 * startingPoint}`, `565`)
                    }
                    else {
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 6
                        roster.strokeText(`Role: Captain`, `105`, `200`)
                        roster.fillText(`Transport`, `${105 + 325 * startingPoint}`, `565`)
                        const membertransportimage = await TheCanvas.loadImage(`./canvas/Transport${membersupportship.level}.png`)
                        roster.drawImage(membertransportimage, 105 + 325 * startingPoint, 590, 100, 140)
                        roster.strokeStyle = `#ffe803`
                        roster.lineWidth = 4
                        roster.moveTo(135 + 325 * startingPoint, 655)
                        roster.lineTo(135 + 325 * startingPoint, 595)
                        roster.lineTo(205 + 325 * startingPoint, 595)
                        let economynumber = 0
                        for(let economy of membersupportship.economy) {
                            let position = 600 + 20 * economynumber
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 6
                            roster.strokeText(`${economy}`, `${210 + 325 * startingPoint}`, `${position}`)
                            roster.fillText(`${economy}`, `${210 + 325 * startingPoint}`, `${position}`)
                            economynumber++
                        }
                        if(membersupportship.level > 2 ) {
                            roster.moveTo(135 + 325 * startingPoint, 700)
                            roster.lineTo(135 + 325 * startingPoint, 760)
                            roster.lineTo(150 + 325 * startingPoint, 760)
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 6
                            roster.strokeText(`${membersupportship.support}`, `${155 + 325 * startingPoint}`, `765`)
                            roster.fillText(`${membersupportship.support}`, `${155 + 325 * startingPoint}`, `765`)
                        }
                        roster.strokeStyle = `#ffe803`
                        roster.lineWidth = 4
                        roster.stroke()
                    }
                }
                else if(membersupport.toLowerCase() === "miner"){
                    membersupportship = client.playersPrimeDB.get(`${bgmember}`, `miner`)
                    roster.font = `17px "Crusader"`
                    if(membersupportship.level === 0){
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 6
                        roster.strokeText(`Miner not set`, `${105 + 325 * startingPoint}`, `565`)
                        roster.fillText(`Miner not set`, `${105 + 325 * startingPoint}`, `565`)
                    }
                    else {
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 6
                        roster.strokeText(`Miner`, `${105 + 325 * startingPoint}`, `565`)
                        roster.fillText(`Miner`, `${105 + 325 * startingPoint}`, `565`)
                        const membernminerimage = await TheCanvas.loadImage(`./canvas/Miner${membersupportship.level}.png`)
                        roster.drawImage(membernminerimage, 105 + 325 * startingPoint, 590, 100, 140)
                        roster.strokeStyle = `#ffe803`
                        roster.lineWidth = 4
                        roster.moveTo(135 + 325 * startingPoint, 655)
                        roster.lineTo(135 + 325 * startingPoint, 595)
                        roster.lineTo(205 + 325 * startingPoint, 595)
                        let economynumber = 0
                        for(let economy of membersupportship.mining) {
                            let position = 600 + 20 * economynumber
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 6
                            roster.strokeText(`${economy}`, `${210 + 325 * startingPoint}`, `${position}`)
                            roster.fillText(`${economy}`, `${210 + 325 * startingPoint}`, `${position}`)
                            economynumber++
                        }
                        if(membersupportship.level > 2 ) {
                            roster.moveTo(135 + 325 * startingPoint, 700)
                            roster.lineTo(135 + 325 * startingPoint, 760)
                            roster.lineTo(150 + 325 * startingPoint, 760)
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 6
                            roster.strokeText(`${membersupportship.support}`, `${155 + 325 * startingPoint}`, `765`)
                            roster.fillText(`${membersupportship.support}`, `${155 + 325 * startingPoint}`, `765`)
                        }
                        roster.strokeStyle = `#ffe803`
                        roster.lineWidth = 4
                        roster.stroke()
                    }
                }
                else if (membersupport.toLowerCase() === "") {
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 6
                    roster.strokeText(`No support ship chosen`, `${105 + 325 * startingPoint}`, `565`)
                    roster.fillText(`No support ship chosen`, `${105 + 325 * startingPoint}`, `565`)
                }
                startingPoint++
            }
        }
        else{
            break
        }
    }



    return rosterImage.toBuffer();

}


function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.strokeStyle = 'black'
        context.lineWidth = 6
        context.strokeText(line, x, y)
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.strokeStyle = 'black'
    context.lineWidth = 6
    context.strokeText(line, x, y)
    context.fillText(line, x, y);
  }