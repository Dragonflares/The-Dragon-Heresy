import { Command } from '../../../../lib';
import { Member, Corp, Battlegroup } from '../../database';

export class ResignCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'resign',
            aliases: ['ccorp'],
            description: "Removes you from your previous Corporation.",
            usage: "&resign."
        });
    }

    async run(message, args){
        let targetb
        let user = message.mentions.users.first()
        if(!user){
            targetb = message.guild.member(message.author)
        }
        else return message.channel.send("You cannot force another Member to resign their Corporation!")

        let MemberResult = (await Member.findOne({discordId: targetb.id.toString()}))
        if(!MemberResult)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            Member.findOne({discordId: targetb.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === "-1")
                    return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
                else {
                    this.leaveCorporation("Member", message, MemberDataResult)
                }
            })
        }
        return message.channel.send(`You've succesfully resigned your corp`)
    }


    leaveBattlegroup = async (ObtainedCorp, MemberDataResult) => {
        ObtainedCorp.battlegroups.forEach(battlegroup => {
            Battlegroup.findOne({_id: battlegroup}, (err, result) => {
                if(err) {
                    message.channel.send("An unexpected error ocurred, please contact my creator.")
                    return console.log(err)
                }
                else if(!result) {
                    return message.channel.send("Well this is awkward. Seems like someone fucked up the database and erased your Corporation midway... (Blame it on the devs)")
                }
                else {
                    let newMemberList = result.members.filter(member => member.toString() != MemberDataResult._id)
                    if(MemberDataResult.battlegroupRank === "Captain") {
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

    leaveCorporation = async (newRank, message, MemberDataResult) => {
        let OldCorporation
        Corp.findOne({corpId: MemberDataResult.Corp.corpId}, (err, ObtainedOne) => {
            if(err) return console.log(err)
            else {
                this.leaveBattlegroup(ObtainedOne, MemberDataResult)   
                let remainingMembers = ObtainedOne.members.filter(member => member.toString() != MemberDataResult._id.toString())
                ObtainedOne.members = remainingMembers
                ObtainedOne.save()
            }
        })

        let NewCorporation
        await (Corp.findOne({corpId: "-1"}, (err, ObtainedOne) => {
            if(err) return console.log(err)
            if(!ObtainedOne) {
                const corp = new Corp({
                    _id: new Mongoose.Types.ObjectId(),
                    name: "No Corporation worth mentioning",
                    corpId: "-1"
                })
                corp.save()
                setTimeout(this.assignNewCorp, 1000, newRank, message, corp, MemberDataResult)
            }
            else {
                setTimeout(this.assignNewCorp, 1000, newRank, message, ObtainedOne, MemberDataResult)
            }
            
        }))
        
    }

    assignNewCorp = async (newRank, message, corp, MemberDataResult) => {
        MemberDataResult.rank = newRank
        MemberDataResult.battlegroupRank = ""
        MemberDataResult.Corp = corp._id
        MemberDataResult.save().catch(err => console.log(err))
    }
}