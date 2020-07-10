let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
let Player = require("../../../player.js")
const TechModel = require("../../../Models/Techs")

module.exports = {
    name: "findtech",
    aliases: ["ftech"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows who owns the tech in the corp.",
    usage: "&findtech (player)",
    run: async (client, message, args) => {
		const tech = message.content.split(" ")
		   let embed = new RichEmbed()
            .setColor("RANDOM")
		if(!tech[1]) {
            embed.setTitle(`**Known Techs**`)

            let categories = new Map([
				["Economy", []],
				["Mining", []],
				["Weapons", []],
				["Support", []],
				["Shields", []]
			]);
			Object.entries(TechData).forEach(([name, data]) => categories.get(data.Category).push(name));
			categories.forEach((data, name) => embed.addField(`*${name}*`, categories.get(name).join(', ')));
            return message.channel.send(embed)
        }
        else {
            if(!TechData[tech[1]]) return message.channel.send(`There's no tech with said name!`)
				
			let requester = message.guild.member(message.author)
			let error = false

			let author = (await MemberModel.findOne({discordId: requester.id.toString()}).catch(err => console.log(err)))
			if(!author) 
				return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
			else {
				let Carrier = await MemberModel.findOne({discordId: requester.id.toString()}).populate("Corp").exec()
				if(Carrier.Corp.corpId != message.guild.id.toString()){
					return message.channel.send("You aren't a Member of this Corporation!")
				}
			}
           return  getFindTechInformation(message, tech[1])
  
		}
    }
}


async function getFindTechInformation(message,module){
		let embed = new RichEmbed().setColor("RANDOM")
		let techs = `${TechData[module].Description}\n`
        embed.setTitle(`**Tech: ${module}**`)
		embed.setThumbnail(`${TechData[module].Image}`)		
		let corpmembers = message.guild.members
		let playersWithTech = ""
		
		for (let [k, member] of corpmembers) {
			let corpMember  = await MemberModel.findOne({discordId: member.id.toString()}).populate("Corp")
			if(corpMember)
			{
				if(corpMember.Corp.corpId == message.guild.id.toString())
				{
					let techrequest = await TechModel.findOne({name: module, playerId: member.id})	
					if(techrequest)								
						if(techrequest.level >0)
							playersWithTech +=  `${corpMember.name} ${techrequest.level}.\n`
				}
			}
		}
		if(playersWithTech) 
			embed.addField("*Players*", `${playersWithTech}`)
		else
			embed.addField(`*Warning*`,`There are no members with this tech.`)
		return message.channel.send(embed)
}
