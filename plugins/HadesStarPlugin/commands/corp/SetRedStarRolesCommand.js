import { CorpCommand } from './CorpCommand'
import { RedStarRoles, Member,Corp } from '../../database'
import Mongoose from 'mongoose'

export class SetRedStarRolesCommand extends CorpCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'setredstarroles',
            aliases: ['srsr'],
            description: "Sets the red star role for the usage of the red star queue to tag and notify players in such level.",
            usage: "&srsr <level> <role name/Tag>."
        });
    }
    async run(message, args) {
        if (message.mentions.users.length > 0) return message.channel.send("I'll ignore that you just tagged a person for a role related command.")
  
        //Get Author
        const members = await message.guild.members.fetch();
        let author
        await members.forEach(member => {
            if (member.id === message.author.id) {
                author = member
            }
        })

        //If not admin
        if ((!message.mentions.roles && args.length < 2) || args.length < 1) {
            return message.channel.send("I do intend to remind you there is a point about either spacing or knowing how to follow user documentations.")
        }
        else if (isNaN(args[0])) {
            return message.channel.send("Honestly, it should be a number on that first argument.")
        }
        else {

            if (!author.permissions.has("ADMINISTRATOR") && !author.permissions.has("MANAGE_GUILD")) {

                const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate("rankRoles").exec()
                let roles = corp.rankRoles
                let AuthorRoles = author.roles.cache.map(role => role.id)

                if (!AuthorRoles.includes(roles.Officer) && !AuthorRoles.includes(roles.FirstOfficer)) {
                    return message.channel.send("You don't have the authority to modifiy the red star roles of your Corp's server.")
                } else {
                    let mention = message.mentions.roles.first().id
                    setRedStarRole(args[0], mention, message)
                }
            } else {

                let mention = message.mentions.roles.first().id
                setRedStarRole(args[0], mention, message)
            }
        }
    }
}

async function findRole(roles, query) {

}

async function setRedStarRole(redStarLevel, roleId, message) {
    const corp = await Corp.findOne({ corpId: message.guild.id.toString() })
    if (!corp) {
        return message.channel.send("This server isn't a registered Corp, who would of though of that.")
    }
    else {
        if (!corp.redStarRoles) {
            let newRedStarRoles = new RedStarRoles({
                _id: new Mongoose.Types.ObjectId(),
                corpId: message.guild.id.toString(),
                redStarRoles: { default: "help" }
            })
            newRedStarRoles.redStarRoles.set(`${redStarLevel}`, `${roleId}`)
            newRedStarRoles.save()
            corp.redStarRoles = newRedStarRoles._id
            corp.save()

        }
        else {
            let existentRedStarRoles = await RedStarRoles.findOne({ corpId: message.guild.id.toString() })
            existentRedStarRoles.redStarRoles.set(`${redStarLevel}`, `${roleId}`)
            existentRedStarRoles.save()
        }
        return message.channel.send(`The role for Red Star ${redStarLevel} is set.`)
    }
}