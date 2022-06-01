import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { confirmResultButtons } from '../../utils';

export class StatusWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'statusws',
      aliases: ['statws'],
      description: "Start a White Star status message.",
      usage: "srws <wsrole>"
    });
  }

  async run(message, args) {
    let user = message.author
    let roles = message.mentions.roles.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!roles) {
        let allRoles = message.guild.roles.cache.map(a => a.name)
        allRoles = allRoles.filter(function (item) {
          return item !== "@everyone"
        })

        let roleName = await confirmResultButtons(message, args.join(' '), allRoles)
        if (!roleName) return;
        roles = message.guild.roles.cache.find(r => r.name === roleName);
      }
      if (member.Corp.corpId === message.guild.id.toString())
        return this.statusMessage(message, roles, member)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  statusMessage = async (message, role, member) => {
    message.delete({ timeout: 1 });    //Delete User message
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').exec()
    if (!ws) {
      message.channel.send("There is no ws going on with that role!")
    } else {

      if (ws.statusmessage) {
        let msg = await this.client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString())
        msg.delete({ timeout: 1 })
      }
      //Send Message
      const rolesEmbed = await WsUtils.whiteStarStatusMessage(message, ws);

      //Send Message
      const messageReaction = await message.channel.send({embeds:[rolesEmbed]});

      //React
      WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.react(react))

      //Save new ids in the database
      ws.statusmessage = messageReaction.id.toString()
      ws.statuschannel = messageReaction.channel.id.toString()

      await ws.save();
    }

  }
}

