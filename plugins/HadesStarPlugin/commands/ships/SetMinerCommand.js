import { ShipCommand } from './ShipCommand';
import { Member, Miner, Tech } from '../../database';
import TechData from '../../../../assets/techs.json';
import Mongoose from 'mongoose';

export class SetMinerCommand extends ShipCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setminer',
            aliases: ['setm'],
            description: "Sets the Member's intended miner for White Stars.",
            usage: "&setminer, then answer the bot's questions. Don't state any levels unless asked for."
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
        else return message.channel.send("You cannot set another Member's Miner!")

        let member = (await Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Miner set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Miner set")
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
                            return message.channel.send("The Member you attempted to request a Miner from isn't from this Corporation.")
                    Miner.findOne({_id: Obtained.miner}, (err, miner) => {
                        if(!miner) {
                            let NewMiner = new Miner({
                                _id: new Mongoose.Types.ObjectId(),
                                mining: []
                            })
                            Obtained.miner = NewMiner._id
                            this.createModifyMiner(message, targetb, Obtained, NewMiner)
                        }
                        else {
                            this.createModifyMiner(message, targetb, Obtained, miner)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }

    createModifyMiner = async (message, targetb, Obtained, miner) => {
        let minername
        let minerlevel
        let minermining
        let minersupport
        message.channel.send("Please name your miner")
        try {
            minername = await message.channel.awaitMessages(message2 => message2.content.length < 16 
                && message2.author.id === targetb.id, {
                max: 1,
                time: 40000,
                errors: ['time', 'length']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner name, check if it's larger than 15 characters.");
        }

        message.channel.send("Please state your miner's level")
        try {
            minerlevel = await message.channel.awaitMessages(message2 => message2.content < 7 && message2.content > 0 
                && message2.author.id === targetb.id, {
                max: 1,
                time: 40000,
                errors: ['time', 'level']
            });
        } catch (err) {
            console.error(err);
            return message.channel.send("Invalid miner level.");
        }
        
        if(parseInt(minerlevel.first().content) > 2) {
            message.channel.send("Please state your miner's support module")
            try {
                minersupport = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Support", {
                    max: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid miner's support module.");
            }
            let supporttech = await (Tech.findOne({name: minersupport.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
            if(supporttech.level == 0) return message.channel.send("You don't have this support module researched!")
            miner.support = supporttech._id
        }
        let repetitions
        if(parseInt(minerlevel.first().content) < 3) repetitions = parseInt(minerlevel.first().content)
        else repetitions = parseInt(minerlevel.first().content) - 1

        miner.name = minername.first().content
        miner.level = parseInt(minerlevel.first().content)
        miner.mining = []

        message.channel.send("Please state your miner's mining modules, pressing enter between each of them.")
        var i = 0

        for(i ; i < repetitions ; i++) {
            try {
                minermining = await message.channel.awaitMessages(message2 => TechData[message2] && TechData[message2].Category === "Mining", {
                    max: 1,
                    time: 40000,
                    errors: ['time', 'name']
                });
            } catch (err) {
                console.error(err);
                return message.channel.send("Invalid miner's mining modules.");
            }
            let miningtech = await (Tech.findOne({name: minermining.first().content, playerId: targetb.id.toString()}).catch(err => console.log(err)))
            if(miningtech.level == 0) return message.channel.send("You don't have this mining module researched!")
            miner.mining.push(miningtech)
        }
        miner.save()
        Obtained.save()
        return message.channel.send("Your miner for white stars is now set.")
    }
}