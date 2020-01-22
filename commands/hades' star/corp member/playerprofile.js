const TechData = require("../../../techs.json")
let { RichEmbed } = require("discord.js")
const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
const TechModel = require("../../../Models/Techs")
const { registerFont, Canvas} = require(`canvas`);
const TheCanvas = require(`canvas`)
const { Attachment } = require(`discord.js`);

module.exports = {
    name: "playerprofile",
    aliases: ["prof"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows info about yourself or a certain player.",
    usage: "&playerprofile (player)",
    run: async (client, message, args) => {
        let target
        const user = message.mentions.users.first()
        if(!user) {
            target = message.guild.member(message.author)
        }
        else {
            target = message.guild.member(user)
        }  
        let CorpMember
        let CorpMember2 = (await MemberModel.findOne({discordId: target.id.toString()}).catch(err => console.logg(err)))
        if(!CorpMember2) {
            if(!user) return message.channel.send("You were never part of a Corporation! You must join one to have a profile!")
            else return message.channel.send("This Member isn't part of any Corporation, therefore has no profile.")
        }
        else {
            await MemberModel.findOne({discordId: target.id.toString()}).populate("Corp").exec((err, result) => {
                if(err) return console.log(err)
                else {
                    CorpMember = result
                    return setTimeout(createProfile, 500, message, CorpMember)
                }
            })
        }
    }
}


async function createProfile(message, CorpMember){
    let ProfileEmbed = new RichEmbed().setColor("RANDOM")
    ProfileEmbed.setTitle(`Player: **${CorpMember.name}**`)

    let playerrank = CorpMember.rank
    let playercorp = CorpMember.Corp.name
    let playertimezone = CorpMember.timezone
    let playerrslevel = CorpMember.rslevel
    let playerwhitestaron = CorpMember.wsStatus

    ProfileEmbed.addField(`*Corporation*`, `${playercorp}`)
    ProfileEmbed.addField(`*Rank*`, playerrank)
    ProfileEmbed.addField(`*Time Zone*`, `GMT ${playertimezone}`) 
    ProfileEmbed.addField(`*Red Star level*`, `${playerrslevel}`)
    ProfileEmbed.addField(`*Avaible for White Stars*`, `${playerwhitestaron}`)
    ProfileEmbed.setFooter("For the techs this player has, use &playertech, for their white star battleship, use &playerbattleship")
    
    return message.channel.send(ProfileEmbed)
}