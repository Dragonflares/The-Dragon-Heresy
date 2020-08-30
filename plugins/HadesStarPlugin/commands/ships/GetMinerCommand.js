import { Command } from '../../../../lib';
import { Member, Miner } from '../../database';
import { MessageEmbed } from 'discord.js';

export class GetMinerCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'playerminer',
            aliases: ['getm'],
            description: "Shows the current white star miner a player has.",
            usage: "&playerminer (player)"
        });
    }

    async run(message, args){
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
        let requester = message.guild.member(message.author)
        let error = false

        let author = Member.findOne({discordId: requester.id.toString()}).catch(err => console.log(err))
        if(!author) 
            return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        else {
            Member.findOne({discordId: requester.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    error = true
                    console.log(err)
                    return message.channel.send("There was an issue requesting your profile.")
                }
                else if(authored.Corp.corpId != message.guild.id){
                    error = true
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        if(error) return
        let member = Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Miner set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Miner set")
        }
        else {
            Member.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString())
                        if(!userb)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Miner from isn't from this Corporation.")
                    Miner.findOne({_id: Obtained.miner}, (err, miner) => {
                        if(!miner) {
                            if(!userb)
                                return message.channel.send("You haven't set a Miner yet!")
                            else
                                return message.channel.send("This Member hasn't set a Miner yet!")
                        }
                        else {
                            this.createMinerProfile(miner, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }

    createMinerProfile = async (miner, message) => {
        Miner.findById(miner._id).populate("mining")
            .populate("support")
            .exec((err, obtainedMiner) => {
                if(err) {
                    message.channel.send("There was an error obtaining this Miner from the database")
                    return console.log(err)
                }
                else {
                    let minerEmbed = new MessageEmbed().setColor("PURPLE")
                    minerEmbed.setTitle(`**${obtainedMiner.name}**`)
                    minerEmbed.addField("Level", `${obtainedMiner.level}`)
                    let mining = ""
                    obtainedMiner.mining.forEach(mine => {
                        mining += `${mine.name} ${mine.level}\n`
                    })
                    minerEmbed.addField("Mining", `${mining}`)
                    if(obtainedMiner.level > 2)
                        minerEmbed.addField("Support", `${obtainedMiner.support.name} ${obtainedMiner.support.level}`)
                    return message.channel.send(minerEmbed)
                }
            })
    }
}