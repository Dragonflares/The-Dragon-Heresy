import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';

export class FindTechCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'findtech',
            aliases: ['ftech'],
            description: "Shows who owns the tech in the corp.",
            usage: "&findtech (player)"
        });
    }

    async run(message, args){
        let embed = new MessageEmbed().setColor("RANDOM")
        if(!args[0]) {
            embed.setTitle(`**Known Techs**`)

            const categories = new Map();
            TechTree.technologies.forEach((tech, name) => {
                if(!categories.has(tech.category))
                    categories.set(tech.category, new Set());

                categories.get(tech.category).add(name);
            });

            categories.forEach((techs, name) => {
                embed.addField(`*${name}*`, `${Array.from(techs).join(', ')}`)
            });

            return message.channel.send(embed)
        }
        else {

            const tech = TechTree.find(args[0]);

            if(tech.name.toLowerCase() != args[0].toLowerCase()){
                message.channel.send(`Did you mean *${tech.name}* ?`);
                try {
                    const response = await message.channel.awaitMessages(
                        m => m.author.id === message.author.id,{
                        max: 1,
                        time: 10000,
                        errors: ['time']
                    });

                    if(!["y", "yes", "yeah", "yea", "yup"].includes(response.first().content.toLowerCase())){
                        throw new Error();
                    }
                } catch (err) {
                    return message.channel.send([
                        "Allright, just retry without dyslexia.",
                        "Jesus.. try again.",
                        "Seriously ? Do it again.",
                        "lol",
                        "> https://learnenglish.britishcouncil.org/"
                    ][Math.round(Math.random()*4)]);
                }
            }
                
            
        
            let requester = message.guild.member(message.author)
            let error = false

            let member = await Member.findOne({discordId: requester.id.toString()}).populate("Corp").exec()
            if(!member) 
                return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
            
            if(member.Corp.corpId != message.guild.id.toString())
                return message.channel.send("You aren't a Member of this Corporation!")

            return this.getFindTechInformation(message, tech)
        }
    }

    async getFindTechInformation(message, tech){
            let embed = new MessageEmbed().setColor("RANDOM")
            let techs = `${tech.description}\n`;
            embed.setTitle(`**Tech: ${tech.name}**`)
            embed.setThumbnail(`${tech.image}`);
            let corpmembers = await message.guild.members.fetch();
            let playersWithTech = ""
            
            for (let [k, member] of corpmembers) {
                let corpMember  = await Member.findOne({discordId: member.id.toString()}).populate("Corp")
                if(corpMember)
                {
                    if(corpMember.Corp.corpId == message.guild.id.toString())
                    {
                        let techrequest = await Tech.findOne({name: tech.name, playerId: member.id})  
                        if(techrequest)                             
                            if(techrequest.level >0)
                                playersWithTech +=  `${corpMember.name} ${techrequest.level}.\n`
                    }
                }
            }
            if(playersWithTech) embed.addField("*Players*", `${playersWithTech}`)
            return message.channel.send(embed)
    }
}