import { Command } from '../../../../lib';
import { Member, Corp, Tech } from '../../database';
import TechData from '../../../../assets/techs.json';
import Mongoose from 'mongoose';

export class AddMemberCommand extends Command{
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
        let MemberResult = (await Member.findOne({discordId: target.id.toString()}))
        if(!MemberResult) {
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
                this.generateTechSection(newArrival)
                this.addToCorporation(newArrival, message)
                setTimeout(this.saveNewArrival, 5000, newArrival)
                message.channel.send("I've successfully added " + newArrival.name + " to this Corporation")
        }
        else{
            Member.findOne({discordId: target.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                if(err)
                    return console.log(err)
                if(MemberDataResult.Corp.corpId === "-1"){
                    this.addToCorporation(MemberDataResult, message)
                    setTimeout(this.saveNewArrival, 5000, MemberDataResult)
                    return message.channel.send("The Member has been added to the Corporation!")
                }
                else if(MemberDataResult.Corp.corpId != message.guild.id.toString())
                    return message.channel.send("This Member is part of another Corporation called " + MemberDataResult.Corp.name + ". He should resign his previous Corp first.")
                else
                    return message.channel.send("This Member is already part of this Corporation")
            })
        }
    }

    async generateTechSection(arrival){
        let order = 0
        for(let techname1 in TechData){
            let tech = new Tech({
                _id: new Mongoose.Types.ObjectId(),
                name: techname1,
                level: 0,
                category: TechData[techname1].Category,
                order: order,
                playerId: arrival.discordId.toString()
            })
            arrival.techs.push(tech)
            tech.save().catch(err => console.log(err))
            order++
        }
    }

    saveNewArrival = async (arrival) => {
        arrival.save().catch(err => console.log(err))
    }
    async addToCorporation(arrival, message){
        Corp.findOne({corpId: message.guild.id.toString()},(err, corp) => {
            if(err) console.log(err)
            else {
                if(!corp) {
                    let corporation = new Corp({
                        _id: new Mongoose.Types.ObjectId(),
                        name: message.guild.name,
                        corpId: message.guild.id.toString(),
                        members: []
                    });
                    arrival.Corp = corporation._id
                    corporation.members.push(arrival)
                    setTimeout(this.saveCorporation, 5000, corporation)
                    message.channel.send("Created this Coporation in the Hades' Corps area! It will be visible from any server who I am in when they ask for the known Corporations!")
                }
                else{
                    arrival.Corp = corp._id
                    corp.members.push(arrival)
                    setTimeout(this.saveCorporation, 5000, corp)
                }
            }
        }).catch(err => console.log(err))
    }

    saveCorporation = async (corp) => {
        corp.save().catch(err => console.log(err))
    }
}