import { Member, Corp } from '../../../plugins/HadesStarPlugin/database'
import Mongoose from 'mongoose'

class DAOCorp {
    /**Finds or creates a Corp in the database.
     * @param message The message that will use to pinpoint the Corp
    */
    static async findOrCreate(message) {
        let corp = await Corp.findOne({corpId: message.channel.guild.id})
        if(!corp) {
            let corporation = new Corp({
                _id: new Mongoose.Types.ObjectId(),
                name: message.guild.name,
                corpId: message.guild.id,
                members: []
            });
            await corporation.save();
            message.channel.send("Created this Corporation in the Hades' Corps area! It will be visible from any server who I am in when they ask for the known Corporations! (although this can be configured later to be removed)")
            return corporation
        }
        else return corp
    }
    /**Finds a Corporation
     * @param message The message that will use to pinpoint the Corp
    */
    static async find(CorpsId) {
        let corp = await Corp.findOne({corpId: CorpsId})
        if(!corp) {
            return null
        }
        else return corp
    }
    /** Brings the fake Corp for the people with no Corps.
     * @param member the member with no Corp
     * @return Corporation
    */
    static async removeFromCorp(member) {
        if(!member.Corp){
            let populatedMember = await Member.findOne({_id: member._id}).populate('Corp').exec()
            let oldCorp = await Corp.find(populatedMember.Corp.corpId)
            if(!oldCorp) {}
            else {
                let remainingMembers = oldCorp.members.filter(aMember => aMember.toString() != member._id.toString())
                oldCorp.members = remainingMembers
                oldCorp.save()
            }
        }
        this.addToEmptyCorp(member)
    }

    static async addToEmptyCorp(member) {
        let corp = await Corp.findOne({corpId: "-1"})
        if(!corp) {
            let corporation = new Corp({
                _id: new Mongoose.Types.ObjectId(),
                name: "No Corporation worth mentioning",
                corpId: "-1",
                members: []
            });
            member.Corp = corporation._id
            await member.save()
            await corporation.save();
        }
        else {
            member.Corp = corp._id
            await member.save()
        }
    }
    /** Populates the member list of a Corp.
     * @return Corp (populated member list)
    */
    static async populateMembers(corporation) {
        return await Corp.findOne({_id: corporation._id}).populate('members').exec()
    }

    static async populateRanks(corporation) {
        return await Corp.findOne({_id: corporation._id}).populate('rankRoles').exec()
    }

    static async addToCorporation(arrival, guild){
        const corp = await Corp.findOne({corpId: guild.id.toString()});
        if(!corp) {}
        else {
            arrival.Corp = corp._id
            corp.members.push(arrival);
            await corp.save();
            await arrival.save();
        }
    }
}

export const CorpDAO = DAOCorp;