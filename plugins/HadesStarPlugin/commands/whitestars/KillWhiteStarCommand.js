import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';

export class KillWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'killws',
      aliases: ['kws'],
      description: "Kill a White Star.",
      usage: "&rws <wsrole> (description)"
    });
  }

  async run(message, args) {
    let user = message.author
    let roles = message.mentions.roles.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!roles) return message.channel.send("Please input a discord role for the WS!")
      if (member.Corp.corpId === message.guild.id.toString())
        return this.killWS(message, roles)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  killWS = async (message, role) => {
    message.delete({ timeout: 1 });    //Delete User message

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('groupsRoles').exec()
    if (ws) {
        WsUtils.killWS(this.client, ws, message)
      return message.channel.send(`${role.name} White Star Killed!`)
    } else {
      return message.channel.send(`No White Star in ${role.name} to kill!`)
    }
  }
}

