import { MemberCommand } from './MemberCommand';
import { Member, Corp } from '../../database';
import { TechTree } from '../../techs';
import { findBestMatch } from 'string-similarity';
import { confirmResult } from '../../utils';

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
        let target
        let CorpMember
        const user = message.mentions.users.first()
        if (!user) {
            if (!args[0]) {
                target = message.guild.member(message.author)
                CorpMember = (await Member.findOne({ discordId: target.id.toString() }).populate("Corp").populate("techs").exec().catch(err => console.logg(err)))
            } else {
                let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate("members.techs").exec();
                let memberslist = new Map(corp.members.map(t => [t.name, t]))
                const rate = findBestMatch(args[0], [...memberslist.keys()]);
                if (!await confirmResult(message, args[0], rate.bestMatch.target))
                    return;
                CorpMember = (await Member.findOne({ discordId: memberslist.get(rate.bestMatch.target).discordId.toString() }).populate("Corp").populate("techs").exec().catch(err => console.logg(err)))
            }
        }
        else {
            target = message.guild.member(user)
            CorpMember = (await Member.findOne({ discordId: target.id.toString() }).populate("Corp").populate("techs").exec().catch(err => console.logg(err)))
        }

        if (!CorpMember) {
            if (!user) return message.channel.send("You were never part of a Corporation! You must join one to have a profile!")
            else return message.channel.send("This Member isn't part of any Corporation, therefore has no profile.")
        }
        else {
            return this.getResearchTime(CorpMember, message) 
        }
    }
    getResearchTime = async (member, message) => {
        const memberTechsArray  = member.techs.filter(t => t.level > 0).sort((a,b) => a.name>b.name?1:-1);
        const sortedTech = memberTechsArray.map(t=>[t.name,t.level])
        let time =0;
        let cost =0;
        Array.from(sortedTech).forEach(element => {
            var i;
            for (i = 1; i < element[1]+1; i++) {
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
               cost+= parseInt(TechTree.find(element[0]).properties.get('Unlock Price')[i-1].replace(/\,/g, ''))
            }  
        });
        time *= 1000;
        var diffDays = Math.floor(time / 86400000); // days
        var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
        var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes
        let messageConcat = `${diffDays} days, ${diffHrs} hours and ${diffMins} minutes of research! It costed ${cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} credits!`
        return message.channel.send(messageConcat)
    }
}