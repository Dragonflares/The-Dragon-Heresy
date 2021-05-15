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


	guildMemberUpdate = async (oldMember, newMember) => {
		//The bot will only mind if the Corp exists in HS
		let Corp = await CorpDAO.find(newMember.guild.id)
		if(Corp != null) {
			if(oldMember.nickname != newMember.nickname){
				if(!newMember.nickname)
					console.log("New member name " + newMember.user.username)
				else
					console.log("New member name " + newMember.nickname)
				return this.updateRun(newMember)
			}
			Corp = await CorpDAO.populateRanks(Corp)
			//Checks if it gets a Merc role from the Guild
			if(!oldMember.roles.cache.has(Corp.rankRoles.Mercenary) && newMember.roles.cache.has(Corp.rankRoles.Mercenary) && !oldMember.roles.cache.has(Corp.rankRoles.Member)){
				let arrival = await MemberDAO.findOrCreate(newMember)
				if(!arrival.Corp) await CorpDAO.addToEmptyCorp(arrival)
			}
			// Check for the Member role
			else if(!oldMember.roles.cache.has(Corp.rankRoles.Member) && newMember.roles.cache.has(Corp.rankRoles.Member)){
				let arrival = await MemberDAO.findOrCreate(newMember)
				if(!arrival.Corp) await CorpDAO.addToCorporation(arrival, newMember.guild)
				else {
					let postArrival = await MemberDAO.PopulateMember(arrival, "Corp")
					if(postArrival.Corp.corpId === '-1') 
						await CorpDAO.addToCorporation(postArrival, newMember.guild)
					else if(!oldMember.guild.me.hasPermission("ADMINISTRATOR") || !oldMember.guild.me.hasPermission("MANAGE_GUILD")){
						oldMember.guild.systemChannel.send(`Excuse me, but ${oldMember} is already part of ${postArrival.Corp.name}, I don't have the power to remove his member role, so please, DO SO.`)
					}
					else {
						oldMember.guild.systemChannel.send(`Excuse me, but ${oldMember} is already part of ${postArrival.Corp.name}, I've removed his role, so he should probably resign his Corp before.`)
						newMember.roles.remove(newMember.guild.roles.cache.get(Corp.rankRoles.Member))
					}
				}
			}
			// Checks if the member was removed
			else if (oldMember.roles.cache.has(Corp.rankRoles.Member) && !newMember.roles.cache.has(Corp.rankRoles.Member)) {
				let theMember = await MemberDAO.find(oldMember) 
				CorpDAO.removeFromCorp(theMember)				
			}
		}
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