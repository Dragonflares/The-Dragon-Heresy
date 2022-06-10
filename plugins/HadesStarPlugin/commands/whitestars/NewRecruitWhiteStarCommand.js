import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp, WhiteStarRoles } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js'
import * as WsMessages from '../../utils/whiteStarsMessages.js'
import Mongoose from 'mongoose'
import { confirmResultButtons } from '../../utils';
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } from 'discord.js';

export class NewRecruitWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'nrecruitws',
      aliases: ['nrws', 'n'],
      description: "Start a White Star recruit message.",
      usage: "&nrws <wsrole> ",
      hidene: true
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
        if (!args[0]) return message.channel.send("You need to input a role.")
        let allRoles = message.guild.roles.cache.map(a => a.name)
        allRoles = allRoles.filter(function (item) {
          return item !== "@everyone"
        })

        let roleName = await confirmResultButtons(message, args.join(' '), allRoles)
        if (!roleName) return;
        roles = message.guild.roles.cache.find(r => r.name === roleName);
      }


      let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('rankRoles').exec();
      let memberCheck = message.guild.members.cache.get(message.author.id)
      if (memberCheck.roles.cache.some(role => role.id == corp.rankRoles.Officer || role.id == corp.rankRoles.WhiteStarCommander))
        return this.roleMessage(message, roles, member)
      else
        return message.channel.send("You are not an Officer of this Corp!")

    }
  }

  roleMessage = async (message, role, member) => {
    message.delete({ timeout: 1 });    //Delete User message

    //Variables
    let description = ""
    let corporation = ""
    let nature = ""
    let expectedtime = null

    //Check that no ws exists and if does, reprint the rectuit?
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('groupsRoles').exec()
    if (!ws) {
      //Create new ws
      const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec()
      //Get default whitestarroles
      let groupsRoles = await WhiteStarRoles.findOne({ Corp: corp, wsrole: role.id }).exec()
      if (!groupsRoles) {
        groupsRoles = new WhiteStarRoles({
          Corp: corp,
          wsrole: role.id,
          bsGroupsRoles: new Array(),
          spGroupsRoles: new Array()
        });
        await groupsRoles.save()
      }

      let newWhiteStar = new WhiteStar({
        _id: new Mongoose.Types.ObjectId(),
        author: member,
        Corp: corp,
        wsrole: role.id,
        description: description,
        corporation: corporation,
        nature: nature,
        expectedtime: expectedtime,
        recruitmessage: null,
        retruitchannel: null,
        statusmessage: null,
        statuschannel: null,
        scantime: null,
        matchtime: null,
        status: "NotStarted",
        members: new Array(),
        preferences: new Map(),
        leadPreferences: new Map(),
        groupsRoles: groupsRoles,
        groupNotes: new Map(),
        playerBsNotes: new Map(),
        playerSpNotes: new Map()
      })

      //Send Message
      const recruitEmbed = await WsMessages.whiteStarRecruitMessage(newWhiteStar);

      //Create Buttons
      let buttonSetup = new MessageButton().setStyle(1).setLabel("Setup").setCustomId("setup")
      let buttonSave = new MessageButton().setStyle(3).setLabel("Start").setCustomId("start")

      //Add Button
      let secondRow = new MessageActionRow()
      secondRow.addComponents([buttonSetup, buttonSave]);

      //Send Message
      const messageReaction = await message.channel.send({ embeds: [recruitEmbed], components: [secondRow] });

      //Save new ids in the database
      newWhiteStar.recruitmessage = messageReaction.id.toString()
      newWhiteStar.retruitchannel = messageReaction.channel.id.toString()

      //Save db
      await newWhiteStar.save()

      await WsUtils.recruitCollector(this.client,messageReaction,newWhiteStar);

    } else {
      //TODO if recruiting then resend message. if not..send the recruit done thingy
      return message.channel.send("There is an ongoing whitestar on that role.")
    }
    /*

    
    create an embeed
    
    send a setup and start button
    dont let start with no message
    
    if setup, popup the other buttons  setdetails setmembers setroles setexpectedtime
    
        */

    /*
    if (!role) return message.channel.send("You need to input a valid role!")
    let description = 'Do you wish to partake in this White Star?';
    if (desc) description = desc

    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('groupsRoles').exec()
    if (!ws) {
      //Create new Whitestar

      const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec()
      //Get default whitestarroles
      let groupsRoles = await WhiteStarRoles.findOne({ Corp: corp, wsrole: role.id }).exec()
      if (!groupsRoles) {
        groupsRoles = new WhiteStarRoles({
          Corp: corp,
          wsrole: role.id,
          bsGroupsRoles: new Array(),
          spGroupsRoles: new Array()
        });
        await groupsRoles.save()
      }

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
        groupsRoles: groupsRoles,
        groupNotes: new Map(),
        playerBsNotes: new Map(),
        playerSpNotes: new Map()
      })

      //Debug
      if (description == "debug") {
        let member = await Member.findOne({ discordId: "333191213576486922" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '🗡️',)
        let roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)

        member = await Member.findOne({ discordId: "692163705877561344" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '❓',)
        roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)

        member = await Member.findOne({ discordId: "712596390097977395" }).exec();
        newWhiteStar.members.push(member)
        newWhiteStar.preferences.set(member.discordId, '❓',)
        roleMember = await message.guild.members.fetch(member.discordId)
        roleMember.roles.add(newWhiteStar.wsrole)
      }

      //Send Message
      const rolesEmbed = await WsUtils.whiteStarRecruitMessage(newWhiteStar);

      //Send Message
      const messageReaction = await message.channel.send({ embeds: [rolesEmbed] });

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
        const messageReaction = await message.channel.send({ embeds: [recruitEmbed] });

        //React
        WsUtils.whiteStarPrefEmojiGroup.forEach(async (value, key
        ) => await messageReaction.react(key))
        WsUtils.whiteStarRecruitReactions.forEach(async react => await messageReaction.react(react))

        //Save new ids in the database
        ws.recruitmessage = messageReaction.id.toString()
        ws.retruitchannel = messageReaction.channel.id.toString()

        //Save
        await ws.save()
      } else {
        return message.channel.send("A WS is running on that group!")
      }

    }*/
  }
}

