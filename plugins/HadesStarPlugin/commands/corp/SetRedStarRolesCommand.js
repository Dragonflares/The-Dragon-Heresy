import { CorpCommand } from './CorpCommand';
import { Corp } from '../../database';
import { MessageManager } from 'discord.js';

export class SetRedStarRolesCommand extends CorpCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setredstarroles',
            aliases: ['srsr'],
            description: "Sets the red star role for the usage of the red star queue to tag and notify players in such level.",
            usage: "&srsr <level> <role name/Tag>."
        });
    }
    async run(message, args){
        if(message.mentions.users.length > 0) return message.channel.send("I'll ignore that you just tagged a person for a role related command.")
        let author 
        await members.forEach(member => {
            if(member.id === message.author.id) {
                author = member
            }  
        })
        if(!author.hasPermission("ADMINISTRATOR") || !author.hasPermission("MANAGE_GUILD")) {
            let MemberResult = (await Member.findOne({discordId: author.id}))
            if(!MemberResult)
                return message.channel.send("You aren't a member of any Corporations.")
            else{
                Member.findOne({discordId: author.id}).populate("Corp").then(member => {
                    if(member.Corp.corpId != message.guild.id.toString())
                        return message.channel.send("You aren't a member of this Corporation.")
                    else{
                        if(member.rank === "Member" || member.rank === "Senior Member")
                            return message.channel.send("You don't have the authority to modifiy the red star roles of your Corp's server.")
                    }
                }).catch(err => console.log(err))
            }
        }
        if(args.length < 2){
            return message.channel.send("I do intend to remind you there is a point about either spacing or knowing how to follow user documentations.")
        }
        else if (isNaN(args[0])){
            return message.channel.send("Honestly, it should be a number on that first argument.")
        }
        else{
            if(!message.mentions.roles){
                let currentroles = [] 
                await message.guild.roles.fetch()
                    .then(roles => roles.cache.forEach(role => {
                        currentroles.push(role)
                    }))
                let role = findRole(currentroles, args[1])
                setRedStarRole(args[0], role.id, message)
            }
            else {
                let mention = args[1].slice(3,-1)
                setRedStarRole(args[0], mention, message)
            }
        }
    }
}

async function findRole(roles, query){
    
}

async function setRedStarRole(redStarLevel, roleId, message){
    const corp = await Corp.findOne({corpId: message.guild.id.toString()})
    if(!corp){
        return message.channel.send("This server isn't a registered Corp, who would of though of that.")
    }
    else {
        corp.redStarRoles.set(`${redStarLevel}`,`${roleId}`)
        return message.channel.send(`The role for Red Star ${redStarLevel} is set.`)
    }
}