import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js'
import Mongoose from 'mongoose'

export class RecruitWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'recruitws',
      aliases: ['rws'],
      description: "Start a White Star recruit message.",
      usage: "&rws <wsrole> (description)"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let roles = message.mentions.roles.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('rankRoles').exec();
      if (user.roles.cache.find(r=> r == corp.rankRoles.Officer))
        return this.roleMessage(message, roles, args.join(' '), member)
      else
        return message.channel.send("You are not an Officer of this Corp!")
    }
  }

  roleMessage = async (message, role, desc, member) => {
    message.delete({ timeout: 1 });    //Delete User message

    let description = 'Do you wish to partake in this White Star?';
    if (desc) description = desc

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').exec()
    if (!ws) {
      //Create new Whitestar
      const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec()
      let newWhiteStar = new WhiteStar({
        _id: new Mongoose.Types.ObjectId(),
        author: member,
        Corp: corp,
        wsrole: role.id,
        description: description,
        recruitmessage: null,
        retruitchannel: null,
        statusmessage: null,
        statuschannel: null,
        scantime: null,
        matchtime: null,
        status: "Recruiting",
        members: new Array(),
        preferences: new Map(),
        leadPreferences: new Map(),
        bsGroupsRoles: new Array(),
        spGroupsRoles: new Array(),
        groupNotes: new Map(),
        playerBsNotes: new Map(),
        playerSpNotes: new Map()
      })

      //Debug
      if (description == "debug") {
        let member = await Member.findOne({ discordId: "624387466907877376" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '🗡️',)
        let roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)

        member = await Member.findOne({ discordId: "741855907129983040" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '❓',)
        roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)

        member = await Member.findOne({ discordId: "626878307203284994" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '❓',)
        roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)
      }

      //Send Message
      const rolesEmbed = await WsUtils.whiteStarRecruitMessage(newWhiteStar);

      //Send Message
      const messageReaction = await message.channel.send(rolesEmbed);

      //React
      WsUtils.whiteStarPrefEmojiGroup.forEach(async (value, key) => await messageReaction.react(key))
      WsUtils.whiteStarRecruitReactions.forEach(async react => await messageReaction.react(react))

      //Save new ids in the database
      newWhiteStar.recruitmessage = messageReaction.id.toString()
      newWhiteStar.retruitchannel = messageReaction.channel.id.toString()

      //Save
      await newWhiteStar.save();
    } else {
      if (ws.status == "Recruiting") {
        let msg;

        //Check if previous message exists and if does, delete
        try {
          msg = await this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString())
          if (msg) msg.delete({ timeout: 1 })
        } catch { }

        //Send Message
        let recruitEmbed = await WsUtils.whiteStarRecruitMessage(ws);
        const messageReaction = await message.channel.send(recruitEmbed);

        //React
        WsUtils.whiteStarPrefEmojiGroup.forEach(async (value, key) => await messageReaction.react(key))
        WsUtils.whiteStarRecruitReactions.forEach(async react => await messageReaction.react(react))

        //Save new ids in the database
        ws.recruitmessage = messageReaction.id.toString()
        ws.retruitchannel = messageReaction.channel.id.toString()

        //Save
        await ws.save()
      } else {
        return message.channel.send("A WS is running on that group!")
      }

    }
  }
}

