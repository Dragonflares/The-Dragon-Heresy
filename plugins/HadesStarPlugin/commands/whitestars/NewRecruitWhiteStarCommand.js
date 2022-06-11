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
      hidden: true
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
    let newWhiteStar = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('groupsRoles').exec()
    if (!newWhiteStar) {
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

      newWhiteStar = new WhiteStar({
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
      });
    } else {
      //fetch recruit msg and delete
      try{
      let msg = await this.client.channels.cache.get(newWhiteStar.retruitchannel).messages.fetch(newWhiteStar.recruitmessage.toString())
      if (msg) msg.delete({ timeout: 1 })
      }catch(r){}
    }
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

    await WsUtils.recruitCollector(this.client, messageReaction, newWhiteStar);

  }
}

