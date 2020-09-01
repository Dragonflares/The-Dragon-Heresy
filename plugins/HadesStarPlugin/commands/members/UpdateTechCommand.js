import { MemberCommand } from './MemberCommand';
import { TechTree } from '../../techs';
import { Member, Tech } from '../../database';

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
            target = message.guild.member(message.author)
        }
        else if(message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's tech!")

        const messagesplit = message.content.split(" ")
        const techName = args[0];

        if(!techName) return message.channel.send(`Please specify the tech you want to update.`)

        const tech = TechTree.find(techName);

        if(tech.name.toLowerCase() != techName.toLowerCase()){
            message.channel.send(`Did you mean *${tech.name}* ?`);
            try {
                const response = await message.channel.awaitMessages(
                    m => m.author.id === message.author.id,{
                    max: 1,
                    time: 10000,
                    errors: ['time']
                });

                if(!["y", "yes", "yeah", "yea", "yup"].includes(response.first().content.toLowerCase())){
                    throw new Error();
                }
            } catch (err) {
                return message.channel.send([
                    "Allright, just retry without dyslexia.",
                    "Jesus.. try again.",
                    "Seriously ? Do it again.",
                    "lol",
                    "> https://learnenglish.britishcouncil.org/"
                ][Math.round(Math.random()*4)]);
            }
        }

        const techlevel = parseInt(args[1]);

        if(!techlevel) return message.channel.send(`Please specify the level of the tech you want to update.`)

        if(0 > techlevel || tech.levels < techlevel)
            return message.channel.send(`The level you gave is invalid for that tech!`)
        

        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        if(member.Corp.corpId === message.guild.id.toString()){
            await this.modifyTech(tech, target, techlevel, message);
            return message.channel.send(`Tech level updated.`)  
        }
        return message.channel.send("You aren't on your Corporation's server!")
    }

    modifyTech(tech, target, techlevel, message){
        return Tech.findOneAndUpdate({name: tech.name, playerId: target.id.toString()}, {level: Math.floor(techlevel)});
    }
}