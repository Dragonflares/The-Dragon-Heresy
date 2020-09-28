import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';

export class GetCroidCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'getcroid',
            aliases: ['gcroid'],
            description: "Gets time left of Croid.",
            usage: "&getcroid"
        });
    }

    async run(message, args){
        let target
        let user = message.mentions.users.first()
        if(!user){
            target = message.guild.member(message.author)
        }
        else if(message.author.id === client.creator)
            target = user
        else return message.channel.send("You cannot get another Member's croid!")


        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.getCroid(target, message)    
            else 
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    getCroid = async (target, message) => {
        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        let today = new Date()
        let diffMs = today - member.lastCroid
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        let messageConcat = `${diffDays} days, ${diffHrs} hours and ${diffMins} minutes ago.`
        if(diffDays >0)
            messageConcat+= "Croid is Ready!"
        return message.channel.send(`${messageConcat}`)
    }
}