import { Command } from '../../../../lib';
import { Member, Transport, Tech } from '../../database';
import TechData from '../../../../assets/techs.json';
import Mongoose from 'mongoose';

export class SetTransportCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'settransport',
            aliases: ['settp'],
            description: "Sets the Member's intended transport for White Stars.",
            usage: "&settransport, then asnwer the bot's questions. Don't state any levels unless asked for."
        });
    }

    async run(message, args){
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else if(message.author.id === this.client.creator) {
            targetb = user
        }
        else return message.channel.send("You cannot set another Member's Transport!")

        let member = (await Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Transport set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Transport set")
        }
        else {
            await Member.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString())
                        if(!user)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Transport from isn't from this Corporation.")
                    Transport.findOne({_id: Obtained.transport}, (err, transport) => {
                        if(!transport) {
                            let NewTransport = new Transport({
                                _id: new Mongoose.Types.ObjectId(),
                                economy: []
                            })
                            Obtained.transport = NewTransport._id
                            this.createModifyTransport(message, targetb, Obtained, NewTransport)
                        }
                        else {
                            this.createModifyTransport(message, targetb, Obtained, transport)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }


    createModifyTransport = async (message, targetb, Obtained, transport) => {
        let transportname
        let transportlevel
        let transporteconomy
        let transportsupport
        message.channel.send("Please name your transport")
        try {
            transportname = await message.channel.awaitMessages(message2 => message2.content.length < 16 
                && message2.author.id === targetb.id, {
                max: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid transport name, check if it's larger than 15 characters.");
        }

        message.channel.send("Please state your transport's level")
        try {
            transportlevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 
                && message2.author.id === targetb.id, {
                max: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid transport level.");
        }
        
        if(parseInt(transportlevel.first().content) > 1) {
            message.channel.send("Please state your transport's support module")
            try {
                transportsupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                    max: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid transport's support module.");
            }
            let supporttech = await (Tech.findOne({name: transportsupport.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
            if(supporttech.level == 0) return message.channel.send("You don't have this support module researched!")
            transport.support = supporttech._id
        }
        let repetitions = parseInt(transportlevel.first().content)

        transport.name = transportname.first().content
        transport.level = parseInt(transportlevel.first().content)
        transport.economy = []

        message.channel.send("Please state your transport's economy modules, pressing enter between each of them.")
        var i = 0

        for(i ; i < repetitions ; i++) {
            try {
                transporteconomy = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Economy", {
                    max: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid transport's economy modules.");
            }
            let economytech = await (Tech.findOne({name: transporteconomy.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
            if(economytech.level == 0) return message.channel.send("You don't have this economy module researched!")
            transport.economy.push(economytech)
        }
        transport.save()
        Obtained.save()
        return message.channel.send("Your transport for white stars is now set.")
    }
}