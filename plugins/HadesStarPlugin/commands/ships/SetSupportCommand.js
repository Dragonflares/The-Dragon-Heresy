import { ShipCommand } from './ShipCommand';
import { Member } from '../../database';

export class SetSupportCommand extends ShipCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setsupport',
            aliases: ['setsp'],
            description: "Sets which kind of support ship you are taking to the White Star.",
            usage: "&setsupport <supportcategory>"
        });
    }

    async run(message, args){
        let targetb
        if(message.mentions.users > 0) return message.channel.send("You cannot set another player's support ship!")
        targetb = message.guild.member(message.author)
        let Member = Member.findOne({discordId: targetb.id}).catch(err => console.log(err))
        if(!Member)
            return message.channel.send("You haven't joined a Corporation yet! Join one to get a profile!")
        Member.findOne({discordId: targetb.id}).populate("Corp").exec((err, result) => {
            if(err) {
                console.log(err)
                return message.channel.send("There was an error while trying to obtain your profile")
            }
            else {
                if(result.Corp.corpId != message.guild.id.toString()) {
                    return message.channel.send("You aren't on your Corp's Discord server!")
                }
                else {
                    let messagesplit = message.content.split(" ")
                    if(!messagesplit[1])
                        return message.channel.send("Please specify a Support Ship Type, either Miner or Transport, and nothing else.")
                    else if(messagesplit[1].toLowerCase() === "miner") {
                        result.SupportShip = "Miner"
                        result.save()
                        return message.channel.send("You've successfully set a Miner as your White Star Support Ship")
                    }
                    else if(messagesplit[1].toLowerCase() === "transport") {
                        result.SupportShip = "Transport"
                        result.save()
                        return message.channel.send("You've successfully set a Transport as your White Star Support Ship")
                    }
                    else 
                        return message.channel.send("Please specify a Support Ship Type, either Miner or Transport")
                }
            }
        })
    }
}