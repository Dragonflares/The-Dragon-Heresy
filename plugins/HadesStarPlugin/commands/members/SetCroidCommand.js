import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';

export class SetCroidCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setcroid',
            aliases: ['scroid'],
            description: "Sets your set your croid.",
            usage: "&setcroid>"
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
        else return message.channel.send("You cannot set another Member's croid!")

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.setCroid(target, message)    
            else 
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    setCroid = async (target, message) => {
        let newCroidTime = new Date();
        Member.findOneAndUpdate({discordId: target.id.toString()}, {lastCroid: newCroidTime})
        .catch(err => console.log(err))
        return message.channel.send(`Croid Time updated.`)
    }
}