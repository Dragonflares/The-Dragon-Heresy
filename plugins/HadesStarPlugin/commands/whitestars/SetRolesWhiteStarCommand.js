import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, WhiteStarRoles } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import * as WsMessages from '../../utils/whiteStarsMessages.js'

export class SetRolesWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'setrolesws',
      aliases: ['srolesws'],
      description: "Set Ws Roles.",
      usage: "&srolesws @wsrole bs/sp @role"
    });
  }

  async run(message, args) {
    let user = message.author
    let role = message.mentions.roles.first()

    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!role) return message.channel.send("Please input a discord role for the WS!")
      if (member.Corp.corpId === message.guild.id.toString())
        return this.setRolesWs(message)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  setRolesWs = async (message) => {
    //message.delete({ timeout: 1 });    //Delete User message
    let data = message.content.split(" ")
    let role = data[1].replace("<@&", "").replace(">", "")
    let roles = []
    let types = []
    let i;
    for (i = 2; i < data.length; i++) {
      if (data[i] == "") continue;
      if (data[i].startsWith("<"))
        roles.push(data[i].replace("<@&", "").replace(">", ""))
      else
        types.push(data[i])
    }

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role }).populate('author').populate('members').exec()
    if (ws) {
      let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: role }).exec()
      let i;
      for (i = 0; i < roles.length; i++) {
        if (types[i] == "bs") {
          if (!groupsRoles.bsGroupsRoles.includes(roles[i]))
            groupsRoles.bsGroupsRoles.push(roles[i])

        }
        else {
          if (!groupsRoles.spGroupsRoles.includes(roles[i]))
            groupsRoles.spGroupsRoles.push(roles[i])
        }
      }
      await groupsRoles.save()
      //await WsMessages.RefreshStatusMessage(this.client, ws, null);
    } else {
      return message.channel.send(`No WS going in <@&"${role}>`)
    }

  }
}


