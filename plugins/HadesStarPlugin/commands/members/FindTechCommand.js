import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmResultButtons } from '../../utils';
import { Corp, Member, Tech } from '../../database';
import { MessageEmbed } from 'discord.js';

export class FindTechCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'findtech',
            aliases: ['ftech'],
            description: "Shows who owns the tech in the corp.",
            usage: "&findtech (tech) <level>"
        });
    }

    async run(message, args) {

        let embed = new MessageEmbed().setColor("RANDOM")
        if (!args.length) {
            embed.setTitle(`**Known Techs**`)

            const categories = new Map();
            TechTree.technologies.forEach((tech, name) => {
                if (!categories.has(tech.category))
                    categories.set(tech.category, new Set());

                categories.get(tech.category).add(name);
            });

            categories.forEach((techs, name) => {
                embed.addField(`*${name}*`, `${Array.from(techs).join(', ')}`)
            });

            return message.channel.send({ embeds: [embed] })
        }
        else {
            const level = parseInt(args[args.length - 1]);
            const techName = isNaN(level) ? args.join('') : args.slice(0, -1).join('');

            let techs = []
            for (const [key, value] of TechTree.technologies.entries()) {
                techs.push(value._name)
            }

            let techActualName = await confirmResultButtons(message, techName, techs)
            if (!techActualName) return;
            const tech = TechTree.find(techActualName);

            let requester = message.author

            let member = await Member.findOne({ discordId: requester.id.toString() }).populate("Corp").exec()
            if (!member)
                return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")

            if (member.Corp.corpId != message.guild.id.toString())
                return message.channel.send("You aren't a Member of this Corporation!")

            if (!isNaN(level))
                return this.getFindTechInformation(message, tech, level)
            else {
                var d = timer('All &ftech command')
                await this.getFindTechInformation(message, tech, null)
                d.stop();
                return;
            }
        }
    }


    async getFindTechInformation(message, tech, limit) {
       

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
        
        //find tech ID
        const members = Array.from(corp.members)

        let memListSorted = await Promise.all(members.map(async t => [t, await this.GetModule(t, tech.name)]))

        memListSorted = memListSorted
            .filter(([key, value]) => value != null)
            .map(([key, value]) => [value.level, key.name])
            .filter(function ([key, value]) { if (limit) { return key == limit } else { return true } })
            .sort(([keya, valuea], [keyb, valueb]) => keya < keyb ? 1 : -1)
            .map(([key, value]) => `${value} ${key}`)
            .join('\n');
        
        let listLines = memListSorted.split("\n").filter(el => el !== '');
        const itemsAmm = 35
        if (listLines.length >0){ 
            let messAmm= parseInt(listLines.length/itemsAmm)+1;
            for(let i =0;i<messAmm;i++ )
            {
                let embed = new MessageEmbed().setColor("RANDOM")
                embed.setTitle(`**Tech: ${tech.name}**`);
                embed.setThumbnail(`${tech.image}`);
                let mes =""
                for(let l =0;l<itemsAmm;l++ )
                {
                    if(!listLines[l+itemsAmm*i])break;
                    mes = mes + listLines[l+itemsAmm*i] + '\n'
                }
                if(mes!= ""){
                    if(messAmm>1){
                        embed.addField(`*Players (${i+1}/${messAmm})*`, `${mes}`)
                    }else{
                        embed.addField("*Players*", `${mes}`)
                    }
                    message.channel.send({embeds:[embed]})
                }
            }
        }else{
            return message.channel.send('There is nobody with that tech')
        }
        return;
    }
    async GetModule(member, techName) {
        let techFound = await Tech.findOne({ _id: Array.from(member.techs),name: techName, level: { "$gt": 0} })
        return techFound
    }
}

var timer = function (name) {
    var start = new Date();
    return {
        stop: function () {
            var end = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};
