import { Command } from '../../../../lib';
import { Member, Battlegroup, Corp } from '../../database';
import Mongoose from 'mongoose';

export class RemoveMemberCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'removemember',
            aliases: ['rm'],
            description: "Removes an unowrthy member from the Corporation.",
            usage: "&removeMember <@user>"
        });
    }

    async run(message, args){
        let target
        if(message.mentions.users.length > 1) return message.channel.send("You may only remove one person at a time.")
        if(message.mentions.roles.length > 0) message.channel.send("I'll ignore that you just tagged a role.")
        let user = message.mentions.users.first()
        const members = await message.guild.members.fetch();
        if(!user){
            return message.channel.send("You must tag a Member to remove from this Corporation.")
        }
        else {
            await members.forEach(member => {
                if(member.id === user.id) {
                    target = member
                }  
            })
        }
        let author
        members.forEach(member => {
            if(member.id === message.author.id) {
                author = member
            }  
        })
        if(message.author.id === this.client.creator) {    
            removeMember("Member", message, target)            
        }
        else {
            if(!author.hasPermission("ADMINISTRATOR")) {
                if(!author.hasPermission("MANAGE_GUILD")) {
                    let selectedMember = (await Member.findOne({discordId: author.id}))
                    if(!selectedMember)
                        return message.channel.send("You aren't a member of any Corporation")
                    else{
                        Member.findOne({discordId: author.id}).populate("Corp").then(member => {
                            if(member.Corp.corpId != message.guild.id.toString())
                                return message.channel.send("You aren't a member of this Corporation")
                                else{
                                    if(member.rank === "First Officer" || member.rank === "Officer")
                                        return this.removeMember("Member", message, target)
                                    else
                                        return message.channel.send("You don't have the rank to add a member to Corporation, talk to an Officer or a Server Admin to add this person to the Corp")
                                }
                        }).catch(err => console.log(err))
                    }
                }
                else
                    return this.removeMember("Member", message, target)
            }
            else
                return this.removeMember("Member", message, target)
        }
    }

    async leaveBattlegroup(corp, member) {
        corp.battlegroups.forEach(battlegroup => {
            Battlegroup.findOne({_id: battlegroup}, (err, result) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(!result) {
                    return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
                }
                else {
                    let newMemberList = result.members.filter(member => member.toString() != member._id)
                    if(member.battlegroupRank === "Captain") {
                        result.captain = newMemberList[1]
                        Member.findOne({_id: result.captain}, (err, result) => {
                            if(err) return console.log(err)
                            else {
                                result.battlegroupRank = "Captain"
                                result.save()
                            }
                        }) 
                    }
                    if(newMemberList.length === result.members.length){}
                    else {
                        result.members = newMemberList
                        result.save()
                    }
                }
            })
        })
    }


    async removeMember(newRank, message, target) {
        let selectedMember = (await Member.findOne({discordId: target.id.toString()}))
        if(!selectedMember)
            return message.channel.send("This member has never been part of any Corporations. He should join a Corporation before you try to remove him from it.")
        else {
            let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec()
            if(member.Corp.corpId === "-1")
                return message.channel.send("This Member isn't part of any Corporations right now.")
            else
                selectedMember = member 
        }
        await Corp.findOne({corpId: message.guild.id}, (err, ObtainedOne) => {
            if(err) return console.log(err)
            else {
                this.leaveBattlegroup(ObtainedOne, selectedMember)   
                let remainingMembers = ObtainedOne.members.filter(member => member.toString() != selectedMember._id.toString())
                ObtainedOne.members = remainingMembers
                ObtainedOne.save()
            }
        })

        await (Corp.findOne({corpId: "-1"}, (err, ObtainedOne) => {
            if(err) return console.log(err)
            if(!ObtainedOne) {
                let corporation = new Corp({
                    _id: new Mongoose.Types.ObjectId(),
                    name: "No Corporation worth mentioning",
                    corpId: "-1"
                })
                corporation.save()
                setTimeout(this.assignNewCorp, 1000, newRank, message, corporation, selectedMember)
            }
            else {
                setTimeout(this.assignNewCorp, 1000, newRank, message, ObtainedOne, selectedMember)
            }
            
        }))
        return message.channel.send("I've successfully removed this person from the Corp.")
        
    }

    assignNewCorp = async (newRank, message, corp, member) => {
        member.rank = newRank
        member.battlegroupRank = ""
        member.Corp = corp._id
        member.save().catch(err => console.log(err))
    }
}