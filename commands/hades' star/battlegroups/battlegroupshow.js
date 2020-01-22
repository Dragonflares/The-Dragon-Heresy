const TechData = require("../../../techs.json")
let { RichEmbed } = require("discord.js")
const Mongoose = require('mongoose')
const GuildModel = require('../../../Models/Guild')
const BattlegroupModel = require('../../../Models/Battlegroup')
const BattleshipModel = require('../../../Models/Battleship')
const MemberModel = require('../../../Models/Member')
const MinerModel = require('../../../Models/Miner')
const TechModel = require('../../../Models/Techs')
const TransportModel = require('../../../Models/Transport')
const { registerFont, Canvas} = require(`canvas`);
const TheCanvas = require(`canvas`)
const { Attachment } = require(`discord.js`);

module.exports = {
    name: "battlegrouplist",
    aliases: ["bglist"],
    category: "hades` star",
    subcategory: "battlegroups",
    description: "Show`s this guild`s battlegroups.",
    usage: "&battlegrouplist (battlegroupname), no stating the name will show which battlegroups you`ve set",
    run: async (client, message, args) => {
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        let battlegroupEmbed = new RichEmbed().setColor("RANDOM")
        let error = false
        let author = (await MemberModel.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! You'll have to join one to be able to interact with Battlegroups.")
        }
        else {
            await MemberModel.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    return message.channel.send("You cannot request information about the White Star Battlegroups of a Corporation you don't belong to!")
                }
                else {
                    officer = authored
                }
            })
        }
        
        let messagesplit = message.content.split(" ")
        if(!messagesplit[1]) {
            ListAllBattlegroups(message, battlegroupEmbed)
        }
        else {
            ListOneBattlegroup(message, messagesplit)
        }
    }
}

async function ListAllBattlegroups(message, battlegroupEmbed) {

    if(message.mentions.users > 0) return message.channel.send("You can`t mention a user for this command.")
    else {
        GuildModel.findOne({corpId: message.guild.id.toString()}).populate("battlegroups").exec((err, Corp) => {
            if(err) {
                message.channel.send("An unexpected error ocurred, please contact my creator.")
                return console.log(err)
            }
            else if(!Corp) {
                return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
            }
            else {
                if(Corp.battlegroups.length < 1) {
                    battlegroupEmbed.setTitle("**There are no Battlegroups in this Corporation!**")
                    battlegroupEmbed.setFooter("You can create a new Battlegroup using &battlegroupcreate")
                    return message.channel.send(battlegroupEmbed)
                }
                else {
                    battlegroupEmbed.setTitle("**Battlegroups**")
                    battlegroupEmbed.setFooter("You can specify a battlegroup name and get a detailed composition of the team")
                    let counterA = 0
                    let counterB = 0
                    let Ready = false
                    let battlegroup = 0
                    for(let element of Corp.battlegroups) {
                        let captain
                        let members = ""
                        MemberModel.findOne({_id: element.captain}, (err, result) => {
                            if(err) {
                                message.channel.send("An unexpected error ocurred, please contact my creator.")
                                return console.log(err)
                            }
                            else {
                                captain = result
                                let counter = 1
                                counterA++
                                for(let member of element.members) {
                                    MemberModel.findOne({_id: member}, (err, result) => {
                                        if(err) {
                                            message.channel.send("An unexpected error ocurred, please contact my creator.")
                                            return console.log(err)
                                        }
                                        else {
                                            if(captain.discordId === result.discordId) {}
                                            else if(counter < (element.members.length - 1)) {
                                                members += `${result.name}, `
                                                counter ++
                                            }
                                            else {
                                                members += `${result.name}.`
                                                battlegroup++
                                                if(battlegroup === Corp.battlegroups.length) {
                                                    Ready = true
                                                }
                                            }
                                            counterB++;
                                            if(counterB === element.members.length) {
                                                battlegroupEmbed.addField(element.name, `*Captain:* ${captain.name}.\n Members: ${members}`)
                                                counterB = 0
                                                if(counterA === Corp.battlegroups.length && Ready) {
                                                    return message.channel.send(battlegroupEmbed)
                                                }
                                            }
                                        }
                                    })
                                }
                            }
                        }) 
                    }
                }
            }
        })
    }
}

async function ListOneBattlegroup(message, messagesplit) {
    BattlegroupModel.findOne({name: messagesplit[1], Corp: message.guild.id.toString()}, (err, ObtainedBG) => {
        if(err) {
            message.channel.send("An unexpected error ocurred, please contact my creator.")
            return console.log(err)
        }
        else if(!ObtainedBG) {
            return message.channel.send("There's no Battlegroup with that name in this Corporation.")
        }
        else {
            let pages = 0
            if(ObtainedBG.members.length < 5) return message.channel.send("There are not enough members in this battlegroup for a white star yet!")
            else if(ObtainedBG.members.length === 5){
                pages = 2
                console.log(pages)
            }
            else if(ObtainedBG.members.length <= 10){
                pages = 3
                console.log(pages)
            }
            else if(ObtainedBG.members.length <= 15) {
                pages = 4
                console.log(pages)
            }
            let a = 1
            ImageLoop(a, pages, message, ObtainedBG, messagesplit)
        }
    })
}

async function ImageLoop(a, pages, message, ObtainedBG, messagesplit) {
    while(a < pages) {
        console.log(a)
        await generateImage(message, ObtainedBG, a, messagesplit)
        a++
    }
}

async function generateImage(message, ObtainedBG, a, messagesplit) {
    const buffer = await roster(message, ObtainedBG, a);
    const filename = `battlegroup-${messagesplit[1]}-page-${a}.jpg`;
    const attachment = new Attachment(buffer, filename);
    await message.channel.send(attachment);
}

async function roster(message, battlegroup, page) {
    let guildmembers = message.guild.members
    let battlegroupmembers = battlegroup.members
    let battlegroupcaptain = battlegroup.captain
    
    const foxCavalier = `./fonts/Fox_Cavalier.otf`
    const batmanfont = "./fonts/batman_forever/batmfa__.ttf"
    const bignoodle = `./fonts/bignoodletitling/big_noodle_titling.ttf`
    const raidercrusader = `./fonts/raider-crusader/raidercrusader.ttf`
    const krazyhazy = `./fonts/krazy-hazy/KrazyHazy.otf`
    const atarian = "./fonts/sf-atarian-system/SF Atarian System Bold.ttf"
    registerFont(batmanfont, {family: `BatmanFonts`})
    registerFont(foxCavalier, {family: `FoxCavalier`})
    registerFont(bignoodle, {family: "Noodle"})
    registerFont(raidercrusader, {family: "Crusader"})
    registerFont(krazyhazy, {family: "Hazy"})
    registerFont(atarian, {family: "Atarian"})

    const rosterImage = new Canvas(1725, 1050)
    const roster = rosterImage.getContext(`2d`)
    const background = await TheCanvas.loadImage(`./canvas/hadesbackground1.jpg`)
    roster.drawImage(background, 0, 0, rosterImage.width, rosterImage.height)
    
    let Captain = await ObtainMember(battlegroupcaptain, message)
    let captainname = Captain.name
    let captainbattleship = await ObtainBattleship(Captain.battleship, message)
    let captainsupportship = await ObtainSupport(Captain, message)
    roster.fillStyle = `#ffe803`
    roster.font = `32px "Atarian"`
    roster.fillText(`Page ${page}`, "839", "1025")
    let startingPoint
    if(page === 1) {
        startingPoint = 1
        roster.globalAlpha = 0.5
        roster.fillStyle = "black"
        roster.fillRect(75, 75, 275, 925)
        roster.globalAlpha = 1
        roster.fillStyle = `#ffe803`
        roster.font = `40px "Atarian"`
        wrapText(roster,captainname,85,115,275,34)
        roster.font = `34px "Atarian"`
        roster.strokeStyle = 'black'
        roster.lineWidth = 5
        roster.strokeText(`Role: Captain`, `85`, `200`)
        roster.fillText(`Role: Captain`, `85`, `200`)
        roster.font = `26px "Atarian"`
        roster.strokeStyle = 'black'
        roster.lineWidth = 5
        roster.strokeText(`Battleship: ${captainbattleship.name}`, `85`, `235`)
        if(captainbattleship.name === "A disgusting price we paid") {
            roster.fillText(`There's no battleship designed`, `85`, `235`) 
        }
        else {
            roster.fillText(`Battleship: ${captainbattleship.name}`, `85`, `235`)
            const captainbattleshipimage = await TheCanvas.loadImage(`./canvas/Battleship${captainbattleship.level}.png`)
            
            roster.drawImage(captainbattleshipimage, 85, 265, 100, 240)
    
            roster.strokeStyle = `#ffe803`
    
            roster.lineWidth = 4
            roster.moveTo(135, 325)
            roster.lineTo(205, 325)
    
            roster.font = `26px "Atarian"`
            roster.strokeStyle = 'black'
            roster.lineWidth = 5
            roster.strokeText(`${captainbattleship.weapon.name} ${captainbattleship.weapon.level}`, `210`, `330`)
            roster.fillText(`${captainbattleship.weapon.name} ${captainbattleship.weapon.level}`, `210`, `330`)
            roster.strokeStyle = `#ffe803`
    
            roster.lineWidth = 4
            roster.moveTo(135, 385)
            roster.lineTo(205, 385)
            roster.strokeStyle = 'black'
            roster.lineWidth = 5
            roster.strokeText(`${captainbattleship.shield.name} ${captainbattleship.shield.level}`, `210`, `390`)
            roster.fillText(`${captainbattleship.shield.name} ${captainbattleship.shield.level}`, `210`, `390`)
            roster.strokeStyle = `#ffe803`
    
            roster.lineWidth = 4
            if(captainbattleship.level < 2) {}
            else {
                roster.moveTo(135, 445)
                roster.lineTo(205, 445)
                let supportnumber = 0
                for(let support of captainbattleship.support) {
                    let position = 450 + 25 * supportnumber
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.strokeText(`${support.name} ${support.level}`, `210`, `${position}`)
                    roster.fillText(`${support.name} ${support.level}`, `210`, `${position}`)
                    supportnumber++
                }
            }
        }
        roster.strokeStyle = `#ffe803`

        roster.lineWidth = 4
        roster.stroke()
        if (!Captain.SupportShip) {
            roster.fillText(`No support ship chosen`, `85`, `565`)
        }
        else if(Captain.SupportShip.toLowerCase() === "transport") {
            if(captainsupportship.level === 0){
                roster.strokeStyle = 'black'
                roster.lineWidth = 5
                roster.strokeText(`Transport not set`, `85`, `565`)
                roster.fillText(`Transport not set`, `85`, `565`)
            }
            else {
                roster.font = `27px "Atarian"`
                roster.strokeStyle = 'black'
                roster.lineWidth = 5
                roster.strokeText(`Transport: ${captainsupportship.name}`, `85`, `565`)
                roster.fillText(`Transport: ${captainsupportship.name}`, `85`, `565`)
                const captaintransportimage = await TheCanvas.loadImage(`./canvas/Transport${captainsupportship.level}.png`)
                roster.drawImage(captaintransportimage, 85, 720, 80, 140)
                roster.strokeStyle = `#ffe803`
                roster.lineWidth = 4
                roster.moveTo(125, 745)
                roster.lineTo(125, 595)
                roster.lineTo(155, 595)
                let economynumber = 0
                for(let economy of captainsupportship.economy) {
                    let position = 600 + 25 * economynumber
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.strokeText(`${economy.name} ${economy.level}`, `165`, `${position}`)
                    roster.fillText(`${economy.name} ${economy.level}`, `165`, `${position}`)
                    economynumber++
                }
                if(captainsupportship.level > 2 ) {
                    roster.moveTo(125, 850)
                    roster.lineTo(125, 910)
                    roster.lineTo(150, 910)
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.strokeText(`${captainsupportship.support.name} ${captainsupportship.support.level}`, `155`, `915`)
                    roster.fillText(`${captainsupportship.support.name} ${captainsupportship.support.level}`, `155`, `915`)
                }
                roster.stroke()
            }
        }
        else if(Captain.SupportShip.toLowerCase() === "miner"){
            if(captainsupportship.level === 0){
                roster.strokeStyle = 'black'
                roster.lineWidth = 5
                roster.strokeText(`Miner not set`, `85`, `565`)
                roster.fillText(`Miner not set`, `85`, `565`)
            }
            else {
                roster.font = `27px "Atarian"`
                roster.strokeStyle = 'black'
                roster.lineWidth = 5
                roster.strokeText(`Miner: ${captainsupportship.name}`, `85`, `565`)
                roster.fillText(`Miner: ${captainsupportship.name}`, `85`, `565`)
                const captainminerimage = await TheCanvas.loadImage(`./canvas/Miner${captainsupportship.level}.png`)
                roster.drawImage(captainminerimage, 85, 720, 100, 140)
                roster.strokeStyle = `#ffe803`
                roster.lineWidth = 4
                roster.moveTo(135, 745)
                roster.lineTo(135, 595)
                roster.lineTo(155, 595)
                let economynumber = 0
                for(let economy of captainsupportship.mining) {
                    let position = 600 + 25 * economynumber
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.strokeText(`${economy.name} ${economy.level}`, `165`, `${position}`)
                    roster.fillText(`${economy.name} ${economy.level}`, `165`, `${position}`)
                    economynumber++
                }
                if(captainsupportship.level > 2 ) {
                    roster.strokeStyle = `#ffe803`
                    roster.moveTo(135, 850)
                    roster.lineTo(135, 910)
                    roster.lineTo(150, 910)
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.strokeText(`${captainsupportship.support.name} ${captainsupportship.support.level}`, `155`, `915`)
                    roster.fillText(`${captainsupportship.support.name} ${captainsupportship.support.level}`, `155`, `915`)
                }
                roster.strokeStyle = 'ffe803'
                roster.stroke()
            }
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
            else {
                roster.globalAlpha = 0.5
                roster.fillStyle = "black"
                roster.fillRect(75 + 325 * startingPoint, 75, 275, 925)
                let member = await ObtainMember(bgmember, message)
                if(member.discordId === Captain.discordId){}
                else {
                    let membername = member.name
                    let memberbattleship = await ObtainBattleship(member.battleship, message)
                    let memberrole = member.battlegroupRank
                    let membersupportship = await ObtainSupport(member, message)

                    roster.globalAlpha = 1
                    roster.strokeStyle = 'black'
                    roster.lineWidth = 5
                    roster.fillStyle = `#ffe803`
                    roster.font = `39px "Atarian"`
                    wrapText(roster,membername,85+ 325 * startingPoint,115,275,34)
                    roster.font = `28px "Atarian"`
                    roster.strokeText(`Role: ${memberrole}`, `${85+ 325 * startingPoint}`, `200`);
                    roster.fillText(`Role: ${memberrole}`, `${85+ 325 * startingPoint}`, `200`)
                    roster.font = `27px "Atarian"`
                    if(memberbattleship.name === "A disgusting price we paid") {
                        roster.fillText(`There's no battleship designed`, `${85+ 325 * startingPoint}`, `235`) 
                    }
                    else {
                        roster.strokeText(`Battleship: ${memberbattleship.name}`, `${85+ 325 * startingPoint}`, `235`)
                        roster.fillText(`Battleship: ${memberbattleship.name}`, `${85+ 325 * startingPoint}`, `235`)
                        const memberbattleshipimage = await TheCanvas.loadImage(`./canvas/Battleship${memberbattleship.level}.png`)
                        
                        roster.drawImage(memberbattleshipimage, 85+ 325 * startingPoint, 265, 100, 240)
                    
                        roster.strokeStyle = `#ffe803`
                    
                        roster.lineWidth = 4
                        roster.moveTo(135 + 325 * startingPoint, 325)
                        roster.lineTo(205 + 325 * startingPoint, 325)
                    
                        roster.font = `27px "Atarian"`
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 5
                        roster.strokeText(`${memberbattleship.weapon.name} ${memberbattleship.weapon.level}`, `${210 + 325 * startingPoint}`, `330`)
                        roster.fillText(`${memberbattleship.weapon.name} ${memberbattleship.weapon.level}`, `${210 + 325 * startingPoint}`, `330`)
                        roster.strokeStyle = `#ffe803`
                    
                        roster.lineWidth = 4
                        roster.moveTo(135 + 325 * startingPoint, 385)
                        roster.lineTo(205 + 325 * startingPoint, 385)
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 5
                        roster.strokeText(`${memberbattleship.shield.name} ${memberbattleship.shield.level}`, `${210 + 325 * startingPoint}`, `390`)
                        roster.fillText(`${memberbattleship.shield.name} ${memberbattleship.shield.level}`, `${210 + 325 * startingPoint}`, `390`)
        
                        roster.strokeStyle = `#ffe803`
                        roster.lineWidth = 4
                        if(memberbattleship.level < 2){}
                        else {
                            roster.moveTo(135 + 325 * startingPoint, 445)
                            roster.lineTo(205 + 325 * startingPoint, 445)
                            let supportnumber = 0
                            for(let support of memberbattleship.support) {
                                let position = 450 + 25 * supportnumber
                                roster.strokeStyle = 'black'
                                roster.lineWidth = 5
                                roster.strokeText(`${support.name} ${support.level}`, `${210 + 325 * startingPoint}`, `${position}`)
                                roster.fillText(`${support.name} ${support.level}`, `${210 + 325 * startingPoint}`, `${position}`)
                                supportnumber++
                            }
                        }
                    }
                    
                    roster.strokeStyle = `#ffe803`
                
                    roster.lineWidth = 4
                    roster.stroke()
                    if (!member.SupportShip) {
                        roster.strokeStyle = 'black'
                        roster.lineWidth = 5
                        roster.strokeText(`No support ship chosen`, `${85 + 325 * startingPoint}`, `565`)
                        roster.fillText(`No support ship chosen`, `${85 + 325 * startingPoint}`, `565`)
                    }
                    else if(member.SupportShip.toLowerCase() === "transport") {
                        roster.font = `27px "Atarian"`
                        if(membersupportship.level === 0){
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 5
                            roster.strokeText(`Transport not set`, `${85 + 325 * startingPoint}`, `565`)
                            roster.fillText(`Transport not set`, `${85 + 325 * startingPoint}`, `565`)
                        }
                        else {
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 5
                            roster.strokeText(`Transport: ${membersupportship.name}`, `${85 + 325 * startingPoint}`, `565`)
                            roster.fillText(`Transport: ${membersupportship.name}`, `${85 + 325 * startingPoint}`, `565`)
                            const membertransportimage = await TheCanvas.loadImage(`./canvas/Transport${membersupportship.level}.png`)
                            roster.drawImage(membertransportimage, 85 + 325 * startingPoint, 720, 80, 140)
                            roster.strokeStyle = `#ffe803`
                            roster.lineWidth = 4
                            roster.moveTo(125 + 325 * startingPoint, 745)
                            roster.lineTo(125 + 325 * startingPoint, 595)
                            roster.lineTo(155 + 325 * startingPoint, 595)
                            let economynumber = 0
                            for(let economy of membersupportship.economy) {
                                let position = 600 + 25 * economynumber
                                roster.strokeStyle = 'black'
                                roster.lineWidth = 5
                                roster.strokeText(`${economy.name} ${economy.level}`, `${165 + 325 * startingPoint}`, `${position}`)
                                roster.fillText(`${economy.name} ${economy.level}`, `${165 + 325 * startingPoint}`, `${position}`)
                                economynumber++
                            }
                            if(membersupportship.level > 2 ) {
                                roster.moveTo(125 + 325 * startingPoint, 850)
                                roster.lineTo(125 + 325 * startingPoint, 910)
                                roster.lineTo(150 + 325 * startingPoint, 910)
                                roster.strokeStyle = 'black'
                                roster.lineWidth = 5
                                roster.strokeText(`${membersupportship.support.name} ${membersupportship.support.level}`, `${155 + 325 * startingPoint}`, `915`)
                                roster.fillText(`${membersupportship.support.name} ${membersupportship.support.level}`, `${155 + 325 * startingPoint}`, `915`)
                            }
                            roster.strokeStyle = `#ffe803`
                            roster.lineWidth = 4
                            roster.stroke()
                        }
                    }
                    else if(member.SupportShip.toLowerCase() === "miner"){
                        roster.font = `27px "Atarian"`
                        if(membersupportship.level === 0){
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 5
                            roster.strokeText(`Miner not set`, `${85 + 325 * startingPoint}`, `565`)
                            roster.fillText(`Miner not set`, `${85 + 325 * startingPoint}`, `565`)
                        }
                        else {
                            roster.strokeStyle = 'black'
                            roster.lineWidth = 5
                            roster.strokeText(`Miner: ${membersupportship.name}`, `${85 + 325 * startingPoint}`, `565`)
                            roster.fillText(`Miner: ${membersupportship.name}`, `${85 + 325 * startingPoint}`, `565`)
                            const membernminerimage = await TheCanvas.loadImage(`./canvas/Miner${membersupportship.level}.png`)
                            roster.drawImage(membernminerimage, 85 + 325 * startingPoint, 720, 100, 140)
                            roster.strokeStyle = `#ffe803`
                            roster.lineWidth = 4
                            roster.moveTo(135 + 325 * startingPoint, 745)
                            roster.lineTo(135 + 325 * startingPoint, 595)
                            roster.lineTo(155 + 325 * startingPoint, 595)
                            let miningnumber = 0
                            for(let mining of membersupportship.mining) {
                                let position = 600 + 25 * miningnumber
                                roster.strokeStyle = 'black'
                                roster.lineWidth = 5
                                roster.strokeText(`${mining.name} ${mining.level}`, `${165 + 325 * startingPoint}`, `${position}`)
                                roster.fillText(`${mining.name} ${mining.level}`, `${165 + 325 * startingPoint}`, `${position}`)
                                miningnumber++
                            }
                            if(membersupportship.level > 2 ) {
                                roster.moveTo(135 + 325 * startingPoint, 850)
                                roster.lineTo(135 + 325 * startingPoint, 910)
                                roster.lineTo(150 + 325 * startingPoint, 910)
                                roster.strokeStyle = 'black'
                                roster.lineWidth = 5
                                roster.strokeText(`${membersupportship.support.name} ${membersupportship.support.level}`, `${155 + 325 * startingPoint}`, `915`)
                                roster.fillText(`${membersupportship.support.name} ${membersupportship.support.level}`, `${155 + 325 * startingPoint}`, `915`)
                            }
                            roster.strokeStyle = `#ffe803`
                            roster.lineWidth = 4
                            roster.stroke()
                        }
                    }
                    startingPoint++
                }
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

async function ObtainMember(battlegroupMember, message) {
    let result = await MemberModel.findOne({_id: battlegroupMember}).catch(err => {
            message.channel.send("An unexpected error ocurred, please contact my creator.")
            return console.log(err)
        }) 
    if(!result) {
        return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased one of the Members of this battlegroup midway... (Blame it on the devs)")
    }
    else {
        return result
    }
}

async function ObtainBattleship(BattleshipId, message) {
    let battleship = await BattleshipModel.findOne({_id: BattleshipId})
    if(!battleship) {
        return new BattleshipModel({
            name: "A disgusting price we paid"
        })
    }
    else {
        let NewBattleship = BattleshipModel.findOne({_id: BattleshipId}).populate("weapon").populate("shield").populate("support")
            .exec().catch(err => console.log(err))
        return NewBattleship
    }
}

async function ObtainSupport(Member, message) {
    if(!Member.SupportShip) {
        return new MinerModel({
            name: "A disgusting price we paid"
        })
    }
    else if(Member.SupportShip === "Miner") {
        let miner = await MinerModel.findOne({_id: Member.miner})
        if(!miner) {
            return new MinerModel({
                name: "A disgusting price we paid"
            })
        }
        else {
            let NewMiner = await MinerModel.findOne({_id: Member.miner}).populate("mining").populate("support")
            .exec().catch(err => console.log(err))
            return NewMiner
        }
    }
    else {
        let Transport = await TransportModel.findOne({_id: Member.transport})
        if(!Transport) {
            return new TransportModel({
                name: "A disgusting price we paid"
            })
        }
        else {
            let NewTransport = await TransportModel.findOne({_id: Member.transport}).populate("economy").populate("support")
            .exec().catch(err => console.log(err))
            return NewTransport
        }
    }
}