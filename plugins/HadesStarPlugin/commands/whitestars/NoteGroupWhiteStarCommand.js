import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar } from '../../database';
import { killWS } from '../../utils';

export class NoteGroupWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'notegroupws',
      aliases: ['ngws'],
      description: "Sets a note to a group.",
      usage: "&npws <wsrole> <grouprole> (note)"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (member.Corp.corpId === message.guild.id.toString())
        return this.noteGroup(message)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  noteGroup = async (message) => {
    message.delete({ timeout: 1 });    //Delete User message
    let data = message.content.split(" ")
    if(data.length <3) return message.channel.send("Not enought arguments!")
    let role = data[1].replace("<@&", "").replace(">", "")
    let groupRole = data[2].replace("<@&", "").replace(">", "")
    let note = data.splice(3).join(' ')
   
    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role}).populate('author').populate('members').exec()
    if (ws) {
        ws.groupNotes.set(groupRole, note)
      await ws.save();
    } else {
      return message.channel.send(`No White Star in ${role.name}`)
    }
  }
}


