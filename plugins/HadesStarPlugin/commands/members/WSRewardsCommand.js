import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';
import WSRewardsData from '../../../../assets/wsrewards.json';

export class WSRewardsCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'wsrewards',
            aliases: ['wsrewards'],
            description: "Get Rewards List.",
            usage: "&wsrewards <members> <rslevel>"
        });
    }

    async run(message, args){
        let target = message.guild.member(message.author)
        let memAmm = parseInt(args[0]);
        let rsLevel = parseInt(args[1]);
        if(!memAmm) return message.channel.send("You must specifiy members amount.");
        else if(memAmm != 5 && memAmm !=10 && memAmm != 15) return message.channel.send("Invalid Amm.")

        if(!rsLevel) return message.channel.send("You must specifiy rs level.");
        else if(rsLevel <3 || rsLevel>10) return message.channel.send("Invalid rs level.")


        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else{
            if(member.Corp.corpId === message.guild.id.toString()) 
                return this.getWhiteStarRewards(target, memAmm, message,rsLevel)    
            
            return message.channel.send("You aren't on your Corporation's server!");
        }
    }

    getWhiteStarRewards = async(target, memAmm, message,rsLevel) => {
       let filteredData;
       let string = '';
       filteredData = WSRewardsData[rsLevel].map(t=> [t,t.Members])
       .filter(([key,value]) => value == memAmm)
        Array.from(filteredData).forEach(element => {
            string += `__Bars: ${element[0].Bars}/3__\n` 
            string += `Win Credits: ${Math.round(element[0].WinCredits)}\n` 
            string += `Win Hydro: ${Math.round(element[0].WinHydro)}\n` 
            string += `Loss Credits: ${Math.round(element[0].LossCredits)}\n` 
            string += `Loss Hydro: ${Math.round(element[0].LossHydro)}\n` 
            string += `Draw Credits: ${Math.round(element[0].DrawCredits)}\n` 
            string += `Draw Hydro: ${Math.round(element[0].DrawHydro)}\n\n` 
        });
       return message.channel.send(string)
    }

}