import { CorpCommand } from './CorpCommand'
import { Corp, Member } from '../../database'
import { MessageEmbed } from 'discord.js';

export class PrintRankRolesCommand extends CorpCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'printrankroles',
            aliases: ['prr'],
            description: "Prints the ranks roles.",
            usage: "&prr"
        });
    }
    async run(message, args) {

        // Delete command
        message.delete({ timeout: 1 });

        let target = message.author

        let member = await Member.findOne({ discordId: target.id.toString() }).exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate("rankRoles").exec()

        let rolesEmbed = new MessageEmbed()
            .setTitle(`${corp.name} Rank roles`)
            .setColor("GREEN")
            .setFooter({ text: `This are the roles used for bot ranks.` })

        let messageString = "";
        let printRoles = [corp.rankRoles.Guest,corp.rankRoles.Trader,corp.rankRoles.Mercenary, corp.rankRoles.Member,
            corp.rankRoles.Officer, corp.rankRoles.WhiteStarCommander, corp.rankRoles.FirstOfficer]
        let printRolesTitle = ['Guest','Trader', 'Mercenary', 'Member', 'Officer', 'WhiteStarCommander', 'FirstOfficer']

        for(let i =0; i< printRoles.length;i++)
        {
            if(printRoles[i] != '') 
                 messageString += `${printRolesTitle[i]}: <@&${printRoles[i]}>\n`
            else
                messageString += `${printRolesTitle[i]}: None\n`
        }

        rolesEmbed.addField("Roles:", messageString)
        return message.channel.send({ embeds: [rolesEmbed] })

    }
}