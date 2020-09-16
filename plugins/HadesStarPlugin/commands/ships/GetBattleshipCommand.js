import { ShipCommand } from './ShipCommand';
import { Member, Battleship } from '../../database';
import { MessageEmbed } from 'discord.js';

export class GetBattleshipCommand extends ShipCommand{
    constructor(plugin){
        super(plugin, {
            name: 'playerbattleship',
            aliases: ['getbs'],
            description: "Changes your red star level.",
            usage: "&setredstar <level>"
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
                else if(authored.Corp.corpId != message.guild.id.toString()){
                    error = true
                    return message.channel.send("You aren't a Member of this Corporation!")
                }
            })
        }
        if(error) return

        let member = Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err))
        if(!member) {
            if(!userb)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to have a Battleship set.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join one to be able to have a Battleship set")
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
                            return message.channel.send("The Member you attempted to request a Battleship from isn't from this Corporation.")
                    Battleship.findOne({_id: Obtained.battleship}, (err, battleship) => {
                        if(!battleship) {
                            if(!userb)
                                return message.channel.send("You haven't set a Battleship yet!")
                            else
                                return message.channel.send("This Member hasn't set a Battleship yet!")
                        }
                        else {
                            this.createBattleshipProfile(battleship, message)
                        }
                    }).catch(err => console.log(err))
                }
            })
        }
    }


    createBattleshipProfile = async (battleship, message) => {
        Battleship.findOne({_id: battleship._id}).populate("weapon").populate("shield").populate("support").exec((err, obtainedBattleship) => {
            if(err) {
                message.channel.send("There was an error obtaining this Battleship from the database")
                return console.log(err)
            }
            else {
                let battleshipEmbed = new MessageEmbed().setColor("RED")
                battleshipEmbed.setTitle(`**${obtainedBattleship.name}**`)
                battleshipEmbed.addField("Level", `${obtainedBattleship.level}`)
                battleshipEmbed.addField("Weapon", `${obtainedBattleship.weapon.name} ${obtainedBattleship.weapon.level}`)
                battleshipEmbed.addField("Shield", `${obtainedBattleship.shield.name} ${obtainedBattleship.shield.level}`)
                if(obtainedBattleship.level > 1) {
                    let supports = ""
                    obtainedBattleship.support.forEach(support => {
                        supports += `${support.name} ${support.level}\n`
                    })
                    battleshipEmbed.addField("Support", `${supports}`)
                }
                return message.channel.send(battleshipEmbed)
            }
        })
    }
}