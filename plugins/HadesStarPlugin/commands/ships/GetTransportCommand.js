import { Command } from '../../../../lib';
import { Member, Transport } from '../../database';
import { MessageEmbed } from 'discord.js';

export class GetTransportCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'playertransport',
            aliases: ['gettp'],
            description: "Shows the current white star transport a player has.",
            usage: "&playertransport (player)"
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
                else if(authored.Corp.corpId.toString() != message.guild.id){
                    error = true
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        if(error) return 
        let member = Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Transport set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Transport set")
        }
        else {
            Member.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, we will see how to handle it.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId.toString() != message.guild.id)
                        if(!userb)
                            return message.channel.send("You aren't on your Corp's main server.")
                        else
                            return message.channel.send("The Member you attempted to request a Transport from isn't from this Corporation.")
                    Transport.findOne({_id: Obtained.transport}, (err, transport) => {
                        if(!transport) {
                            if(!userb)
                                return message.channel.send("You haven't set a Transport yet!")
                            else
                                return message.channel.send("This Member hasn't set a Transport yet!")
                        }
                        else {
                            this.createTransportProfile(transport, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }

    createTransportProfile = async (transport, message) => {
        Transport.findById(transport._id).populate("economy")
            .populate("support")
            .exec((err, obtainedTransport) => {
                if(err) {
                    message.channel.send("There was an error obtaining this Transport from the database")
                    return console.log(err)
                }
                else {
                    let transportEmbed = new RichEmbed().setColor("RED")
                    transportEmbed.setTitle(`**${obtainedTransport.name}**`)
                    transportEmbed.addField("Level", `${obtainedTransport.level}`)
                    let economy = ""
                    obtainedTransport.economy.forEach(mine => {
                        economy += `${mine.name} ${mine.level}\n`
                    })
                    transportEmbed.addField("Economy", `${economy}`)
                    if(obtainedTransport.level > 2)
                        transportEmbed.addField("Support", `${obtainedTransport.support.name} ${obtainedTransport.support.level}`)
                    return message.channel.send(transportEmbed)
                }
            })
    }
}