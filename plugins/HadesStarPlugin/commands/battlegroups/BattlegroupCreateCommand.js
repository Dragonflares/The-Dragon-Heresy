import { Command } from '../../../../lib';
import { Member, Corp, Battlegroup } from '../../database';
import Mongoose from 'mongoose';

export class BattlegroupCreateCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'battlegroupcreate',
            aliases: ['bgcreate'],
            description: "Creates a white star battlegroup and assigns it a captain.",
            usage: "&battlegroupcreate <name> <captain>"
        });
    }

    async run(message, args){
        let targetb
        if(message.mentions.users > 1) return message.channel.send("You've mentioned more than one user.")
        let user = message.mentions.users.first()
        if(!user) return message.channel.send("You must assign a captain to this battlegroup!")
        else targetb = message.guild.member(user)


        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || (messagesplit[1].indexOf("<@") > -1)) return message.channel.send("You must specify a battlegroup name!")

        let officer
        let error = false
        let author = (await Member.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
        }
        else {
            await Member.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    error = true
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    if(!user) {}
                    else {
                        error = true
                        return message.channel.send("You cannot add a Member to a White Star Battlegroup of a Corporation you don't belong to!")
                    }
                }
                else {
                    officer = authored
                }
            })
        }
        if(error) return
        let member = (await Member.findOne({discordId: targetb.id.toString()}).catch(err => console.log(err)))
        if(!member) {
            if(!user)
                return message.channel.send("You haven't joined any Corporations yet! Join one to be able to be added to a White Star Battlegroup.")
            else
                return message.channel.send("This Member hasn't joined any Corporations yet! Get them to join yours to be added to a White Star Battlegroup.")
        }
        else {
            await Member.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, Obtained) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else {
                    if(Obtained.Corp.corpId != message.guild.id.toString()) {
                        if(!user)
                            return message.channel.send("You cannot join a battlegroup of a different Corporation than your own!")
                        else
                            return message.channel.send("This Member isn't part of your Corporation.")
                    }
                    else if(Obtained.battlegroupRank === "") {
                        return this.createBattlegroup(Obtained, message) 
                    }
                    else {
                        return message.channel.send("This Member is already part of another Battlegroup!")
                    }
                }
            })
        }
    }

    createBattlegroup = async (member, message) => {
        let messagesplit = message.content.split(" ")
        member.battlegroupRank = "Captain"
        member.save()
        Battlegroup.findOne({Corp: message.guild.id.toString(), name: messagesplit[1]}, (err, result) => {
            if(err) {
                message.channel.send("An unexpected error ocurred, please contact my creator.")
                return console.log(err)
            }
            else if(!result) {
                let battlegroup = new Battlegroup({
                    _id: new Mongoose.Types.ObjectId(),
                    Corp: message.guild.id.toString(),
                    name: messagesplit[1],
                    captain: member,
                    members: []
                })
                battlegroup.members.push(member)
                battlegroup.save()
                Corp.findOne({corpId: message.guild.id.toString()}, (err, Corp) => {
                    if(err) {
                        message.channel.send("An unexpected error ocurred, please contact my creator.")
                        return console.log(err)
                    }
                    else if(!Corp) {
                        return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
                    }
                    else {
                        Corp.battlegroups.push(battlegroup)
                        Corp.save()
                    }
                })
            }
            else {
                return message.channel.send("There's already a Battlegroup with that name in this Corporation!")
            }
        })

        return message.channel.send("Battlegroup set!")
        
    }
}