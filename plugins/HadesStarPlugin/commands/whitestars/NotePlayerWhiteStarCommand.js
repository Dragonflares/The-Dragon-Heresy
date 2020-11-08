import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar } from '../../database';
import { confirmTech } from '../../utils';

export class NotePlayerWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'noteplayerws',
      aliases: ['npws'],
      description: "Sets a note to a player.",
      usage: "&npws <wsrole> <bs/sp> <note>"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let role = message.mentions.roles.first()
    let player = message.mentions.users.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!role) return message.channel.send("Please input a discord role for the WS!")
      if (!player) return message.channel.send("Please input player in the WS")
      if (!args[0]) return message.channel.send("Please put bs/sp")
      if (args[0] != "sp" && args[0] != "bs") return message.channel.send("Please put bs/sp")
      if (!args[1]) return message.channel.send("Please put a notenote")
      if (member.Corp.corpId === message.guild.id.toString())
        return this.notePlayer(message, role, player, args[0], args.slice(1).join(' '))
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  notePlayer = async (message, role, player, group, note) => {
    message.delete({ timeout: 1 });    //Delete User message

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').exec()
    if (ws) {
      if (group == "bs")
        ws.playerBsNotes.set(player.id, note)
      else
        ws.playerSpNotes.set(player.id, note)
      await ws.save();
    } else {
      return message.channel.send(`No White Star in ${role.name}`)
    }
  }
}


