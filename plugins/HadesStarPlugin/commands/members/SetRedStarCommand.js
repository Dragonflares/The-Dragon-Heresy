import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';

export class SetRedStarCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setredstar',
            aliases: ['srs'],
            description: "Changes your red star level.",
            usage: "&setredstar <level>"
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
        else return message.channel.send("You cannot set another Member's Red Star Level!")

        const messagesplit = message.content.split(" ")
        let level = parseInt(messagesplit[1]);
        if(!level) return message.channel.send("You must specifiy a valid Red Star level.");
        else if(isNaN(level)) return message.channel.send("Invalid Red Star level.")

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.modifyRedStarLevel(target, level, message)    
            
            return message.channel.send("You aren't on your Corporation's server!");
        }
    }
    modifyRedStarLevel = async (target, NewRSLevel, message) => {
        Member.findOneAndUpdate({discordId: target.id.toString()}, {rslevel: NewRSLevel})
        .catch(err => console.log(err))
        return message.channel.send(`Red Star level updated.`)
    }
}