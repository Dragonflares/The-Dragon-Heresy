import { CorpCommand } from './CorpCommand';
import { Member, RedStarMessage, Corp } from '../../database';
import Mongoose from 'mongoose'
import { MessageEmbed } from 'discord.js';

export class StartRoleMessageCommand extends CorpCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'startrolemsg',
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
            .setDescription(`Click to Register/Unregister to/of Red Star Notifications!`)
            .addField("Levels", "1️⃣-🔟 For RS1-RS10 and ‼️ for RS11")
            .setColor("GREEN")
            .setFooter({text:`Have fun!`})

        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '‼️']
        const messageReaction = await message.channel.send({embeds: [rolesEmbed]});

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

        reactions.forEach(async react => await messageReaction.react(react))
    }
}