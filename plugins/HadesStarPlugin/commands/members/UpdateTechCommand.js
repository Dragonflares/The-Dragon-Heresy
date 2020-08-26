import { Command } from '../../../../lib';
import TechData from '../../../../assets/techs.json';
import { Member, Tech } from '../../database';

export class UpdateTechCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'updatetech',
            aliases: ['ut'],
            description: "Updates the level of a specific tech you own.",
            usage: "&updatetech <tech>(no blank spaces) <level>"
        });
    }

    async run(message, args){
        let target
        let user = message.mentions.users.first()
        if(!user){
            target = message.guild.member(message.author)
        }
        else if(message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's tech!")

        const messagesplit = message.content.split(" ")
        const tech = messagesplit[1]

        if(!tech) return message.channel.send(`Please specify the tech you want to update.`)

        if(!TechData[tech]) return message.channel.send(`There's no tech with said name!`)
        const techlevel = messagesplit[2] 

        if(!techlevel) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if((0 > techlevel) || Number(TechData[tech].Level[TechData[tech].Level.length - 1]) < (techlevel)) {
            return message.channel.send(`The level you gave is invalid for that tech!`)
        }
        let MemberResult = (await Member.findOne({discordId: target.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            Member.findOne({discordId: target.id.toString()}).populate('Corp').exec((err, member) => {
                if(err)
                    return console.log(err)
                if(member.Corp.corpId === message.guild.id.toString()) 
                    return this.modifyTech(tech, target, techlevel, message)    
                else 
                    return message.channel.send("You aren't on your Corporation's server!")
            })
        }
    }

    modifyTech(tech, target, techlevel, message){
        Tech.findOneAndUpdate({name: tech, playerId: target.id.toString()}, {level: Math.floor(techlevel)})
        .catch(err => console.log(err))
        return message.channel.send(`Tech level updated.`)
    }
}