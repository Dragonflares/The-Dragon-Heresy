import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';
import { TechTree } from '../../techs';

export class GetResearchTimeCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'getresearchtime',
            aliases: ['grt'],
            description: "Gets how much research time a player done.",
            usage: "&getresearchtime (name)"
        });
    }

    async run(message, args){
        let target = message.mentions.users.first()
        if(!target){
            target = message.guild.member(message.author)
        }

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').populate('techs').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            //if(member.Corp.corpId === message.guild.id.toString()) 
                return this.getResearchTime(member, message)    
            
            return message.channel.send("You aren't on your Corporation's server!");
        }
    }
    getResearchTime = async (member, message) => {
        const memberTechsArray  = member.techs.filter(t => t.level > 0).sort((a,b) => a.name>b.name?1:-1);
        const sortedTech = memberTechsArray.map(t=>[t.name,t.level])
        let time =0;
        Array.from(sortedTech).forEach(element => {
            var i;
            for (i = 1; i < element[1]+1; i++) {
                console.log(`${element[0]} ${i}`)
                if(!TechTree.find(element[0]).properties.get('Research Time')) continue;
               let sPostFix  = TechTree.find(element[0]).properties.get('Research Time')[i-1].slice(-1);
               let num =TechTree.find(element[0]).properties.get('Research Time')[i-1].slice(0, -1);
               let multiplier =0;
               switch(sPostFix) {
                case 'm':
                    multiplier=60;
                  break;
                case 'h':
                    multiplier=60*60;
                  break;
                case 'd':
                    multiplier=60*60*24;
                    break;
                default:
                 console.log(`Werid prefix : ${sPostFix}`)
              }
               time+= num *multiplier;
            }  
        });
        time *= 1000;
        var diffDays = Math.floor(time / 86400000); // days
        var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
        var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
        let messageConcat = `${diffDays} days, ${diffHrs} hours and ${diffMins} minutes of research!`
        return message.channel.send(messageConcat)
    }
}