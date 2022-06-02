import { CorpCommand } from './CorpCommand'
import { Corp, Member } from '../../database'
import { MessageEmbed } from 'discord.js';

export class PrintRedStarRolesCommand extends CorpCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'printredstarroles',
            aliases: ['prsr'],
            description: "Prints the red star role for the usage of the red star queue to tag and notify players in such level.",
            usage: "&prsr"
        });
    }
    async run(message, args) {

        // Delete command
        message.delete({ timeout: 1 }); 

        let target = message.author

        let member = await Member.findOne({ discordId: target.id.toString() }).exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate("redStarRoles").exec()

        let rolesEmbed = new MessageEmbed()
            .setTitle(`${corp.name} Red Star roles`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setColor("GREEN")
            .setFooter({ text: `This are the roles that get pinged when a recruit is open.` })

        let messageString="";

        for (let i = 1; i < 12; i++) {
            if (corp.redStarRoles.redStarRoles.get(i.toString()))
                messageString += `${i.toString()}) <@&${corp.redStarRoles.redStarRoles.get(i.toString())}>\n`
        }

        if (messageString == "")
            rolesEmbed.addField("Roles:","No redstar roles were setup.")
        rolesEmbed.addField("Roles:",messageString)
        return message.channel.send({ embeds: [rolesEmbed] })

    }
}