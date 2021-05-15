import { Manager } from '../../../lib';
import { Member, Corp } from '../database';

export class GuildManager extends Manager{
	constructor(plugin){
		super(plugin);
	}

	enable(){
		if(!this.enabled){
			this.client.on('guildMemberAdd', this.guildMemberAdd);
			this.client.on('guildMemberUpdate', this.guildMemberUpdate);
			this.client.on('guildMemberRemove', this.guildMemberRemove);
		}
		super.enable();
	}

	disable(){
		if(this.enabled){
			this.client.off('guildMemberAdd', this.guildMemberAdd);
			this.client.off('guildMemberUpdate', this.guildMemberUpdate);
			this.client.off('guildMemberRemove', this.guildMemberRemove);
		}
		super.disable();
	}

	guildMemberAdd = (member) => {
	    const channel = member.guild.systemChannel
	    if (!channel) {
	        return console.log('channel doesnt exist')
	    }
	    channel.send(`Welcome ${member}! May the Light of the Khala guide you.`)
	}

	guildMemberUpdate = (oldMember, newMember) => {
	    if(!newMember.nickname)
	        console.log("New member name " + newMember.user.username)
	    else
	        console.log("New member name " + newMember.nickname)
	    return this.updateRun(newMember)
	}

	guildMemberRemove = async (member) => {
	    console.log(member.user.username + " has left the server")
	    let member2 = await Member.findOne({discordId: member.id.toString()})
	    if(!member2) return
	    Member.findOne({discordId: member.id.toString()}).populate("Corp").exec((err, CorpMember) => {
	        if(err) console.log(err)
	        if(!CorpMember){}
	        if(CorpMember.Corp.corpId != member.guild.id.toString()) {}
	        else {
	            this.leaveCorporation("Member", CorpMember)
	        }
	    })
	}


	updateRun = async (newMember) => {
	    let member = await Member.findOne({discordId: newMember.id.toString()})
	    if(!member) return
	    Member.findOne({discordId: newMember.id.toString()}).populate("Corp").exec((err, CorpMember) => {
	        if(err) console.log(err)
	        if(!CorpMember){}
	        if(CorpMember.Corp.corpId != newMember.guild.id.toString()) {}
	        else {
	            if(!newMember.nickname) {
	                CorpMember.name = newMember.user.username
	                CorpMember.save()
	            }
	            else {
	                CorpMember.name = newMember.nickname
	                CorpMember.save()
	            }
	        }
	    })
	}

	leaveBattlegroup = async (ObtainedCorp, MemberDataResult) => {
	    ObtainedCorp.battlegroups.forEach(battlegroup => {
	        BattlegroupModel.findOne({_id: battlegroup}, (err, result) => {
	            if(err) {
	                return console.log(err)
	            }
	            else {
	                let newMemberList = result.members.filter(member => member.toString() != MemberDataResult._id)
	                if(MemberDataResult.battlegroupRank === "Captain") {
	                    result.captain = newMemberList[1]
	                    MemberModel.findOne({_id: result.captain}, (err, result) => {
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

	leaveCorporation = async (newRank, MemberDataResult) => {
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
	            Corporation = new Corp({
	                _id: new Mongoose.Types.ObjectId(),
	                name: "No Corporation worth mentioning",
	                corpId: "-1"
	            })
	            Corporation.save()
	            NewCorporation = Corporation
	            setTimeout(this.assignNewCorp, 6000, newRank, NewCorporation, MemberDataResult)
	        }
	        else {
	            NewCorporation = ObtainedOne
	            setTimeout(this.assignNewCorp, 6000, newRank, NewCorporation, MemberDataResult)
	        }
	        
	    }))
	    
	}

	assignNewCorp = async (newRank, corp, MemberDataResult) => {
	    MemberDataResult.rank = newRank
	    MemberDataResult.battlegroupRank = ""
	    MemberDataResult.Corp = corp._id
	    MemberDataResult.save().catch(err => console.log(err))
	}

}