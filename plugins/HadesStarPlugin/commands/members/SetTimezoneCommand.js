import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';
import { MemberDAO, CorpDAO } from '../../../../lib/utils/DatabaseObjects'

export class SetTimezoneCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'settimezone',
            aliases: ['stime'],
            description: "Sets your time zone to GMT standard, please use +/-<number>.",
            usage: "&settimezone +/-<number>"
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
        else return message.channel.send("You cannot set another Member's timezone!")

        const ActualTimezone = args[0]
        if(!(ActualTimezone.startsWith("+") || ActualTimezone.startsWith("-"))) return message.channel.send("Invalid time zone.")

        let timezone = parseInt(args[0]);
        if(isNaN(timezone)) return message.channel.send("Invalid time zone.")
        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.modifyTimeZone(target, timezone, message)    
            else {
                let Corp = await CorpDAO.find(message.guild.id.toString())
                let rankedCorp = await CorpDAO.populateRanks(Corp)
                if(rankedCorp.rankRoles.Mercenary) {
                    if (target.roles.cache.has(Corp.rankRoles.Mercenary))
                        return this.modifyTimeZone(target, timezone, message) 
                    else
                        return message.channel.send("You aren't on your Corporation's server!")
                }
                else return message.channel.send("You aren't on your Corporation's server!")
            }
        }
    }

    modifyTimeZone = async (target, NewTimezone, message) => {
        Member.findOneAndUpdate({discordId: target.id.toString()}, {timezone: NewTimezone})
        .catch(err => console.log(err))
        return message.channel.send(`Time Zone updated.`)
    }
}