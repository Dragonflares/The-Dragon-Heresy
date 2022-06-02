import { CorpCommand } from './CorpCommand';
import { Member, RedStarMessage, Corp } from '../../database';
import Mongoose from 'mongoose'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js';
import * as RoleMessageUtils from '../../utils/roleMessageUtils'

export class StartRoleMessageCommand extends CorpCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'sartrolemsg',
            aliases: ['srm'],
            description: "Starts Role Message Command.",
            usage: "&startrolemsg"
        });
    }

    async run(message, args) {
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.author
        }
        else if (message.author.id === client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's croid!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            if (member.Corp.corpId === message.guild.id.toString())
                return this.roleMessage(target, message)
            else
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    roleMessage = async (target, message) => {
        message.delete({ timeout: 1 });    //Delete User message

        let rolesEmbed = new MessageEmbed()
            .setTitle(`Select which Red Star Levels you want to get notified!`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`Check which Red Star Notifications you wanna recieve!`)
            .addField("Info", "Press on **Setup** to change your notification settings")
            .setColor("GREEN")
            .setFooter({text:`Have fun!`})


        let startButton = new MessageButton()
        .setStyle(1)
        .setLabel('Start')
        .setCustomId('start')

        let firstRow = new MessageActionRow()
        firstRow.addComponents(startButton)

        const messageReaction = await message.channel.send({embeds: [rolesEmbed], components: [firstRow]});
        RoleMessageUtils.collectorFunc(this.client, messageReaction)

        //Save Message ID
        const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('redStarMessage').exec()
        let newRedStarMessage = new RedStarMessage({
            _id: new Mongoose.Types.ObjectId(),
            rolesMessage: messageReaction.id.toString(),
            rolesMessageChannel: messageReaction.channel.id.toString()
        })
        if (corp.redStarMessage != null) {
            const oldRedStarMessage = await RedStarMessage.findOne({ _id: corp.redStarMessage._id });
            oldRedStarMessage.delete();
        }
        newRedStarMessage.save();
        corp.redStarMessage = newRedStarMessage
        corp.save()
    }
}