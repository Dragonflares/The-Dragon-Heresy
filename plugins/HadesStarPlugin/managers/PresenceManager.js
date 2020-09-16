import { Manager } from '../../../lib';
import { Member } from '../database';

export class PresenceManager extends Manager{
	constructor(plugin){
		super(plugin);
	}

	enable(){
		if(!this.enabled){
			this.client.on('presenceUpdate', this.presenceHandler);
		}
		super.enable();
	}

	disable(){
		if(this.enabled){
			this.client.off('presenceUpdate', this.presenceHandler);
		}
		super.disable();
	}

	presenceHandler = (oldPresence, newPresence) => {
	    if(!oldPresence || newPresence.status != oldPresence.status){
	        if(newPresence.status == "offline") {
	            this.setLastSeenMember(new Date(), newPresence.member)
	        }
	        else {
	            this.setOnlineStatus(newPresence.member)
	        }
	    }
	}

	async setOnlineStatus(newMember) {
	    let member = await Member.findOne({discordId: newMember.id.toString()})
	    if(!member) return
	    Member.findOne({discordId: newMember.id.toString()}).populate("Corp").exec((err, corpMember) => {
	        if(err) console.log(err)
	        if(!corpMember){}
	        if(corpMember.Corp.corpId != newMember.guild.id.toString()) {}
	        else {
	            corpMember.online = true
	            corpMember.save()
	        }
	    })
	}

	async setLastSeenMember(lastSeenDate, newMember) {
	    let member = await Member.findOne({discordId: newMember.id.toString()})
	    if(!member) return
	    Member.findOne({discordId: newMember.id.toString()}).populate("Corp").exec((err, corpMember) => {
	        if(err) console.log(err)
	        if(!corpMember){}
	        if(corpMember.Corp.corpId != newMember.guild.id.toString()) {}
	        else {
	            corpMember.lastSeen = lastSeenDate
	            corpMember.online = false
	            corpMember.save()
	        }
	    })
	}

}