import { Command } from '../../../../lib';
import { Member } from '../../database';

export class DemoteCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'demote',
            aliases: ['dem'],
            description: "Demotes a player rank in a Corp.",
            usage: "&demote <member>."
        });
    }

    async run(message, args){
        const mentionedusers = message.mentions.users
        if(mentionedusers.size > 1) return message.channel.send("You've mentioned more than one user!")
        const mentionned = message.guild.member(mentionedusers.first())
        let author = message.guild.member(message.author)
        if(!mentionned) return message.channel.send("You haven't targeted anyone to demote!")
        
        if(mentionned.id === author.id) return message.channel.send("You can't demote yourself like this! Someone else will have to")
        
        let targetMember = await Member.findOne({discordId: mentionned.id.toString()}).populate("Corp").exec();
        if(!targetMember)
            return message.channel.send("The Member you selected isnt't part of any Corporation. You should add him to one first.")
        if(targetMember.Corp.corpId != message.guild.id.toString()){
            return message.channel.send("You can't demote a Member of another Corporation!")
        }
        const memberrank = targetMember.rank;
        
        let member = (await Member.findOne({discordId: author.id.toString()}))
        if(!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.");

        if(targetMember.Corp.corpId != message.guild.id.toString())
            return message.channel.send("You aren't in your corp's server!");

        const authorrank = targetMember.rank;

        if(authorrank === "Officer") {
            if(memberrank === "Member") return message.channel.send("You cannot demote this person any more! He's a Member!")
            if(memberrank === "Officer") return message.channel.send("You cannot demote a fellow officer!")
            if(memberrank === "First Officer") return message.channel.send("Yeah, nice try, you can't demote your First Officer!")
            if(memberrank === "SeniorMember") {
                this.modifyRank(mentionned, "Member");
                if(!mentionned.nickname) return channel.message.send(`I've successfully demoted ${mentionned.nickname}`)
                return channel.message.send(`I've successfully demoted ${mentionned.user.username}`)
            }
        }
        else if(authorrank == "First Officer") {
            if(memberrank === "Member") return message.channel.send("You cannot demote this person any more! He's a Member!")
            if(memberrank === "Officer") {
                this.modifyRank(mentionned, "Senior Member");
                if(!mentionned.nickname) return channel.message.send(`I don't know what you did, but hope you deserve this demotion ${mentionned.user.username}`)
                return channel.message.send(`I don't know what you did, but hope you deserve this demotion ${mentionned.nickname}`)
            }
            if(memberrank === "First Officer") return message.channel.send("Oh no, you cannot demote yourself. Promote someone else to First Officer if that's your wish.")
            if(memberrank === "SeniorMember") {
                this.modifyRank(mentionned, "Member");
                if(!mentionned.nickname) return channel.message.send(`I've successfully demoted ${mentionned.user.username}`)
                return channel.message.send(`I've successfully demoted ${mentionned.nickname}`)
            }
        }
        else return message.channel.send("You have to be at least an Officer to demote someone!")
    }

    modifyRank = async (target, NewRank) => {
        return Member.findOneAndUpdate({discordId: target.id.toString()}, {rank: NewRank})
    }
}