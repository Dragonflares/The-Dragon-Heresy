import { MemberCommand } from './MemberCommand';
import { RedStarRoles } from '../../database'
import { Member } from '../../database';

export class GetRedStarRoleCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'getrsrole',
            aliases: ['grsrole'],
            description: "Gives you Red Star Role",
            usage: "&getrsrole num"
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
            let level = parseInt(args[0]);
            if(!level) return message.channel.send("You must specifiy a valid Red Star level.");
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.setRSRole(target, message,level)    
            else 
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    setRSRole = async (target, message,level) => {
        let existentRedStarRoles = await RedStarRoles.findOne({corpId: message.guild.id.toString()})
        let role = existentRedStarRoles.redStarRoles.get(`${level}`)
        
        if(!role) {
          return  message.channel.send(`The Role ${level} wasnt setup by server Administrator`);
        }
        let roleMember = message.guild.members.cache.find(r => r.id == message.author.id)
        roleMember.roles.add(role)
        return message.channel.send(`Red Star ${level} Role Given.`)
    }
}