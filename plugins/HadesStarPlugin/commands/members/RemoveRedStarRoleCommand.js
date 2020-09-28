import { MemberCommand } from './MemberCommand';
import { RedStarRoles } from '../../database'
import { Member } from '../../database';

export class RemoveRedStarRoleCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'removersrole',
            aliases: ['rmrsrole'],
            description: "Removes from you a Red Star role.",
            usage: "&removersrole num"
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
                return this.rmRSRole(target, message,level)    
            else 
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    rmRSRole = async (target, message, level) => {
        let existentRedStarRoles = await RedStarRoles.findOne({corpId: message.guild.id.toString()})
        let role = existentRedStarRoles.redStarRoles.get(`${level}`)
        
        if(!role) {
          return  message.channel.send(`The Role ${level} wasnt setup by server Administrator`);
        }
        let roleMember = message.guild.members.cache.find(r => r.id == message.author.id)
        roleMember.roles.remove(role)
        return message.channel.send(`Red Star ${level} Role Removed.`)
    }
}