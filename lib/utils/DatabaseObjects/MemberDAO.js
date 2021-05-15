import { Member, Tech, Corp } from '../../../plugins/HadesStarPlugin/database'
import Mongoose from 'mongoose'
import { TechTree } from '../../../plugins/HadesStarPlugin/techs';


class DAOMember {
     /** Finds or creates a User in the database.
      * @param guildMember the member taken from the guild member's list
      * @return Member (Object)
     */
     static async findOrCreate(guildMember) {
        let member = await Member.findOne({discordId: guildMember.id.toString()})
        if(!member) {
            let memberName
            if(!guildMember.nickname) memberName = guildMember.user.username
            else memberName = guildMember.nickname
            let newMember = new Member({
                _id: new Mongoose.Types.ObjectId(),
                name: memberName,
                discordId: guildMember.id.toString(),
            });
            await this.generateTechSection(newMember)
            await newMember.save();
            return newMember
        }
        else return member
    }
    /* **Finds a database user
    */
    static async find(guildMember) {
        let theMember = await Member.findOne({discordId: guildMember.id.toString()})
        return theMember
    }

    static async generateTechSection(arrival){
        let order = 0
        for(let [techid, tech] of TechTree.get()){
            let dbTech = new Tech({
                _id: new Mongoose.Types.ObjectId(),
                name: tech.name,
                level: 0,
                category: tech.category,
                order: order,
                playerId: arrival.discordId.toString()
            })
            arrival.techs.push(dbTech);
            await dbTech.save();
            order++;
        }
    }

    /** Populates tech list in a member
     * @param member The Member Object requested earlier.
     * @return Member --- Populated member
    */
    static async PopulateMember(member, field) {
        return await Member.findOne({discordId: member.discordId}).populate(field).exec()
    }
}

export const MemberDAO = DAOMember;