import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';

export class RemovePlayerWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'removeplayerws',
      aliases: ['rmpws'],
      description: "Removes a player to a White Star.",
      usage: "&rmpws <wsrole> <player>"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let roles = message.mentions.roles.first()
    let dTarget = message.mentions.users.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!roles) return message.channel.send("Please input a discord role for the WS!")

      let target = await Member.findOne({ discordId: dTarget.id.toString() }).populate("Corp").populate('techs').exec();
      if (!target)
        return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!");

      if (member.Corp.corpId === message.guild.id.toString())
        return this.addPlayerWS(message, roles, target)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  addPlayerWS = async (message, role, player) => {
    message.delete({ timeout: 1 });    //Delete User message

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').exec()
    if (ws) {
      if (ws.preferences.has(player.discordId)) {
        let remainingMembers = await ws.members.filter(m => m.discordId != player.discordId)
        ws.members = remainingMembers
        ws.preferences.delete(player.discordId)
        ws.leadPreferences.delete(player.discordId)
        let roleMember = await message.guild.members.fetch(player.discordId)
        roleMember.roles.remove(ws.wsrole)
        await ws.save()
        await WsUtils.RefreshRecruitMessage(this.client, ws, null);
        return message.channel.send(`${player.name} removed from ${role.name} White Star!`)
      } else {
        return message.channel.send(`${player.name} not in ${role.name}!`)
      }
    } else {
      return message.channel.send(`No White Star in ${role.name}!`)
    }
  }
}


