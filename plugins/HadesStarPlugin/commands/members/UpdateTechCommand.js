import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { confirmResultButtons } from '../../utils';
import { Member, Tech } from '../../database';
import Mongoose from 'mongoose';

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
            target = message.author
        }
        else if(message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's tech!")

        const level     = parseInt(args[args.length-1]);
        const techName  = isNaN(level) ? args.join('') : args.slice(0, -1).join('');

        if(!techName) return message.channel.send(`Please specify the tech you want to update.`)

        let techs = []
        for (const [key, value] of TechTree.technologies.entries()) {
            techs.push(value._name)
        }

        let techActualName = await confirmResultButtons(message, techName, techs)
        if (!techActualName) return;
        const tech = TechTree.find(techActualName);

        if(isNaN(level)) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if(0 > level || tech.levels < level)
            return message.channel.send(`The level you gave is invalid for that tech!`)
        

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').populate('techs').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        if(member.Corp.corpId === message.guild.id.toString()){
            let techFound = await Tech.find({name: tech.name, playerId: target.id.toString()})
            if(techFound.length == 0)
            {
                let orderMax=0;
                member.techs.map(t => {
                    if (t.order> orderMax) orderMax = t.order;
                })
                orderMax = orderMax + 1
                console.log(`Creating new tech ${tech.name} to player`)
                let dbTech = new Tech({
                    _id: new Mongoose.Types.ObjectId(),
                    name: tech.name,
                    level: 0,
                    category: tech.category,
                    order: orderMax,
                    playerId: target.id.toString()
                })
                member.techs.push(dbTech);
                await dbTech.save()
                member.save()
            }
           // console.log(techFound)
            await Tech.findOneAndUpdate({name: tech.name, playerId: target.id.toString()}, {level: Math.floor(level)});
            await message.react(`👏`);
            return message.channel.send(`Tech level updated.`)  
        }
        return message.channel.send("You aren't on your Corporation's server!")
    }
}