import { Command } from '../../../../lib';
import { Member, Corp, Battlegroup } from '../../database';

export class BattlegroupRemoveCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'battlegroupdelete',
            aliases: ['bgdel'],
            description: "Deletes the named battlegroup.",
            usage: "&deletebattlegroup <battlegroupname>"
        });
    }

    async run(message, args){
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        const messagesplit = message.content.split(" ")
        if(!messagesplit[1] || (messagesplit[1].indexOf("<@") > -1)) return message.channel.send("You must specify a battlegroup name!")

        
        let author = (await Member.findOne({discordId: message.author.id.toString()}).catch(err => console.log(err)))
        if(!author) {
            return message.channel.send("You haven't joined any Corporations yet! You'll have ot join one to be able to interact with Battlegroups.")
        }
        else {
            await Member.findOne({discordId: message.author.id.toString()}).populate("Corp").exec((err, authored) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(authored.Corp.corpId != message.guild.id.toString()) {
                    return message.channel.send("You cannot remove a White Star Battlegroup of a Corporation you don't belong to!")
                }
                else {
                    if(authored.rank === "Officer" || authored.rank === "First Officer") {
                        return this.removeBattlegroup(message)
                    }
                    else {
                        return message.channel.send("You must be at least an Officer to remove a Battlegroup!")
                    }
                }
            })
        }
    }


    removeBattlegroup = async (message) => {
        let battlegroupName = message.content.split(" ")[1]
        Battlegroup.findOne({
            Corp: message.guild.id.toString(), name: battlegroupName
        }, (err, ObtainedBG) => {
            if(!ObtainedBG) {
                return message.channel.send("There's no battlegroup with said name in this Corporation!")
            }
            else {
                this.handleMembers(ObtainedBG)
                Corp.findOne({corpId: message.guild.id.toString()}, (err, result) => {
                    if(err) {
                        message.channel.send("An unexpected error ocurred, please contact my creator.")
                        return console.log(err)
                    }
                    else if(!result) {
                        return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
                    }
                    else {
                        let remainingBattlegroups = result.battlegroups.filter(battlegroup => battlegroup.toString() != ObtainedBG._id)
                        if(remainingBattlegroups.length === 0) {
                            result.battlegroups = []
                        }
                        else {
                            result.battlegroups = remainingBattlegroups
                        }
                        result.save()
                    }
                }) 
                Battlegroup.findOneAndDelete({_id: ObtainedBG._id}).exec().catch(err => console.log(err))
                return message.channel.send("Battlegroup removed succesfully")
            }
        }).catch(err => console.log(err))
    }

    handleMembers = async (ObtainedBG) => {
        await ObtainedBG.members.forEach(member => {
            Member.findOne({_id: member}, (err, result) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else {
                    result.battlegroupRank = ""
                    result.save()
                }
            })
        })
    }
}