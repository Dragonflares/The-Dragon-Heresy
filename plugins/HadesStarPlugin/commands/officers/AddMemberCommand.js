import { OfficerCommand } from './OfficerCommand';
import { Member, Corp, Tech } from '../../database';
import { TechTree } from '../../techs';
import Mongoose from 'mongoose';

export class AddMemberCommand extends OfficerCommand{
    constructor(plugin){
        super(plugin, {
            name: 'addmember',
            aliases: ['am'],
            description: "Adds a new member to the Corporation.",
            usage: "&addmember <@user>"
        });
    }

    async run(message, args){
    	let target
        if(message.mentions.users.length > 1) return message.channel.send("You may only add one person at a time.")
        if(message.mentions.roles.length > 0) message.channel.send("I'll ignore that you just tagged a role.")
        let user = message.mentions.users.first();
        const members = await message.guild.members.fetch();
        if(!user){
            return message.channel.send("You must tag a Member to add to this Corporation.")
        }
        else {
            await members.forEach(member => {
                if(member.id === user.id) {
                    target = member
                }  
            })
        }
        let author
        await members.forEach(member => {
            if(member.id === message.author.id) {
                author = member
            }  
        })
        if(message.author.id === this.client.creator) {
            return this.addNewMember(this.client, message, target)
        }
        else {
            if(!author.hasPermission("ADMINISTRATOR")) {
                if(!author.hasPermission("MANAGE_GUILD")) {
                    let MemberResult = (await Member.findOne({discordId: author.id}))
                    if(!MemberResult)
                        return message.channel.send("You aren't a member of any Corporation")
                    else{
                        Member.findOne({discordId: author.id}).populate("Corp").then(member => {
                            if(member.Corp.corpId != message.guild.id.toString())
                                return message.channel.send("You aren't a member of this Corporation")
                            else{
                                if(member.rank === "First Officer" || member.rank === "Officer")
                                    return this.addNewMember(message, target)
                                else
                                    return message.channel.send("You don't have the rank to add a member to Corporation, talk to an Officer or a Server Admin to add this person to the Corp")
                            }
                        }).catch(err => console.log(err))
                    }
                }
                else
                    return this.addNewMember(message, target)
            }
            else
                return this.addNewMember(message, target)
        }
    }

    async addNewMember(message, target) {
        let member = await Member.findOne({discordId: target.id.toString()}).populate('Corp').exec();
        if(!member) {
            let targetName = ""
            if(!target.nickname) targetName = target.user.username
            else targetName = target.nickname
            let newArrival = new Member({
                _id: new Mongoose.Types.ObjectId(),
                name: targetName,
                discordId: target.id.toString(),
                rank: "Member",
                rslevel: 1,
                wsStatus: "No",
            })
            await this.generateTechSection(newArrival);
            await this.addToCorporation(newArrival, message)
            await newArrival.save();
            return message.channel.send("I've successfully added " + newArrival.name + " to this Corporation")
        }
        if(member.Corp.corpId === "-1"){
            await this.addToCorporation(member, message)
            member.save();
            return message.channel.send("The Member has been added to the Corporation!")
        }
        if(member.Corp.corpId != message.guild.id.toString())
            return message.channel.send("This Member is part of another Corporation called " + member.Corp.name + ". He should resign his previous Corp first.")
        return message.channel.send("This Member is already part of this Corporation")
    }

    async generateTechSection(arrival){
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

    async addToCorporation(arrival, message){
        const corp = await Corp.findOne({corpId: message.guild.id.toString()});
        if(!corp) {
            let corporation = new Corp({
                _id: new Mongoose.Types.ObjectId(),
                name: message.guild.name,
                corpId: message.guild.id.toString(),
                members: []
            });
            arrival.Corp = corporation._id
            corporation.members.push(arrival)
            await corporation.save();
            return message.channel.send("Created this Coporation in the Hades' Corps area! It will be visible from any server who I am in when they ask for the known Corporations!")
        }
        arrival.Corp = corp._id
        corp.members.push(arrival);
        await corp.save();
    }
}