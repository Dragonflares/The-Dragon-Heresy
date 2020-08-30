import { Command } from '../../../../lib';
import { Member } from '../../database';

export class PromoteCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'promote',
            aliases: ['prom'],
            description: "Promotes a player in a Corp.",
            usage: "&promote <member>"
        });
    }

    async run(message, args){
        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")

        const member = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)

        if(!member) {
            let MemberResult = (await Member.findOne({discordId: author.id.toString()}))
            if(!MemberResult)
                return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
            else{
                Member.findOne({discordId: author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                    if(err)
                        return console.log(err)
                    if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                        if(author.hasPermission("ADMINISTRATOR")){
                            let rank = MemberDataResult.rank
                            switch(rank){
                                case "Member": {
                                    this.modifyRank(author, "Senior Member")
                                    break
                                }
                                case "Senior Member": {
                                    this.modifyRank(author, "Officer")
                                    break
                                }
                                case "Officer": {
                                    let guildmembers = message.guild.members.values()
                                    for(let member of guildmembers)
                                    {
                                        let possibleFO = Member.findOne({discordId: member.id.toString()})
                                        if(!possibleFO){}
                                        else{
                                            memberrank = possibleFO.rank
                                            if(memberrank === "First Officer"){
                                                let membername = possibleFO.name
                                                return message.channel.send(`There's already a First Officer! It's ${membername}.`)
                                            }
                                        }
                                    }
                                    this.modifyRank(author, "First Officer")
                                    break
                                }
                                case "First Officer": {
                                    return message.channel.send("There's no rank above yours!")
                                }
                            }
                            return message.channel.send("You've been promoted successfully!")
                        }
                        else return message.channel.send("You can't promote yourself!")
                    }
                    else 
                        return message.channel.send("You aren't on your Corporation's server!")
                })
            }
        }
        else {
            if(member.id === author.id) return message.channel.send("You can't promote yourself like this! Don't mention anyone instead")
            let memberrank
            let error = false
            let checkedMemberResult = (await Member.findOne({discordId: member.id.toString()}))
            if(!checkedMemberResult)
                return message.channel.send("The Member you selected isnt't part of any Corporation. You should add him to one first.")
            else{
                let Carrier = await Member.findOne({discordId: member.id.toString()}).populate("Corp").exec()
                if(Carrier.Corp.corpId != message.guild.id.toString()){
                    return message.channel.send("You can't promote a Member of another Corporation!")
                }
                memberrank = Carrier.rank  
            }
            let MemberResult = (await Member.findOne({discordId: author.id.toString()}))
            if(!MemberResult)
                return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
            else {
                Member.findOne({discordId: author.id.toString()}).populate('Corp').exec((err, MemberDataResult) => {
                    if(err) {
                        console.log(err)
                        return message.channel.send("An unexpected error ocurred, please contact my creator.")
                    }
                    else if(MemberDataResult.Corp.corpId === message.guild.id.toString()) {
                        this.upRank(MemberDataResult, memberrank, message, author, member)
                    }
                    else {
                        return message.channel.send("You aren't on your Corporation's server!")
                    }
                })
            }
        }
    }
    

    upRank = async (MemberDataResult, memberrank, message, author, member) => {
        let authorrank = MemberDataResult.rank         
        if(author.hasPermission("ADMINISTRATOR")) {
            switch(authorrank){
                case "Officer": {
                    if(memberrank === "Officer") return message.channel.send("You can't promote another Officer!")
                    if(memberrank === "First Officer") return message.channel.send("You can't promote your First Officer beyond!")
                    if(memberrank === "Senior Member") {
                        this.modifyRank(member, "Officer")
                        return message.channel.send("You have succesfully promoted the other Member")
                    }
                    else {
                        this.modifyRank(member, "Senior Member")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                }
                case "First Officer": {
                    if(memberrank === "Officer") {
                        message.channel.send("Are you sure you want to promote this person to First Officer? Yes/No")
                        let response
                        try {
                            response = await message.channel.awaitMessages(message2 => message2.content.length < 4 , {
                                maxMatches: 1,
                                time: 20000,
                                errors: ['time', 'length']
                            })
                        }
                        catch (err) {
                            console.error(err);
                            return message.channel.send("Invalid confirmation.");
                        }
                        if(response.first().content.toLowerCase() === "yes") {
                            this.modifyRank(member, "First Officer")
                            this.modifyRank(author, "Officer")
                            return message.channel.send("You've succesfully promoted this person to First Officer. You have been demoted to Officer.")
                        }
                        else if(response.first().content.toLowerCase() === "no") {
                            return message.channel.send("You are still our First Officer! Whew!")
                        }
                        else {
                            return message.channel.send("Invalid confirmation.");
                        }
                    }
                    else if(memberrank === "Senior Member") {
                        this.modifyRank(member, "Officer")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                    else {
                        this.modifyRank(member, "Senior Member")
                        return message.channel.send("You have succesfully promoted the other member")
                    }
                }
                default: {
                    return message.channel.send("You must be an officer to promote someone!")
                }
            }
        }
    }

    modifyRank = async (target, NewRank) => {
        Member.findOneAndUpdate({discordId: target.id.toString()}, {rank: NewRank})
        .catch(err => console.log(err))
    }
}