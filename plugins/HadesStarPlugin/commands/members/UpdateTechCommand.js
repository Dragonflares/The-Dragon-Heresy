import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmTech } from '../../utils';
import { Member, Tech } from '../../database';

export class UpdateTechCommand extends MemberCommand{
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

        const level     = parseInt(args[args.length-1]);
        const techName  = isNaN(level) ? args.join('') : args.slice(0, -1).join('');

        if(!techName) return message.channel.send(`Please specify the tech you want to update.`)

        const tech = TechTree.find(techName);

        if(!await confirmTech(message, techName, tech))
            return;

        if(isNaN(level)) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if(0 > level || tech.levels < level)
            return message.channel.send(`The level you gave is invalid for that tech!`)
        

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        if(member.Corp.corpId === message.guild.id.toString()){
            await Tech.findOneAndUpdate({name: tech.name, playerId: target.id.toString()}, {level: Math.floor(level)});
            return message.channel.send(`Tech level updated.`)  
        }
        return message.channel.send("You aren't on your Corporation's server!")
    }
}