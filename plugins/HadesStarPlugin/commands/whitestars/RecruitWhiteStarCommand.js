import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp } from '../../database';
import Mongoose from 'mongoose'
const Discord = require('discord.js');

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
      if (!roles) return message.channel.send("Please input a discord role for the WS!")
      if (member.Corp.corpId === message.guild.id.toString())
        return this.roleMessage(message, roles, args.join(' '),member)
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  roleMessage = async (message, role, desc,member) => {
    message.delete({ timeout: 1 });    //Delete User message

    let description = 'Do you wish to partake in this White Star?';
    if (desc) description = desc

    //Save Message ID
    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').exec()
    if (!ws) {
      //Send Message
      let messageReaction = await this.sendWsMessage(message, role, description, 0, "None",member.name);

      //Create new Whitestar
      const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec()
      let newWhiteStar = new WhiteStar({
        _id: new Mongoose.Types.ObjectId(),
        author: member,
        Corp: corp,
        wsrole: role.id,
        description: description,
        recruitmessage: messageReaction.id.toString(),
        retruitchannel: messageReaction.channel.id.toString(),
        status: "Recruiting",
        members: new Array(),
        preferences: new Map()
      })
      newWhiteStar.save();
    } else {
      if (ws.status == "Recruiting") {

        let msg = await this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString())
        msg.delete({ timeout: 1 })

        //Get Members
        let testString = ""
        ws.members.forEach(t => testString += `${t.name} ${ws.preferences.get(t.discordId)}\n`)
        if (testString == "") testString = "None";

        //Send Message
        let messageReaction = await this.sendWsMessage(message, role, ws.description, Object.keys(ws.members).length, testString,ws.author.name);

        ws.recruitmessage = messageReaction.id.toString()
        ws.retruitchannel = messageReaction.channel.id.toString()
        ws.save()
      } else {
        return message.channel.send("A WS is running on that group!")
      }

    }
  }

  sendWsMessage = async (message, role, description, amount, members,author) => {
    let rolesEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${author}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`${description}`)
      .addField("Group:", `<@&${role.id}>`)
      .addField("Current People", amount)
      .addField("Members", members)
      .setColor("ORANGE")
      .setFooter(`⚔️ - Attack 🛡️ - Guardian 🗡️ - Assassin ❓ - Doesnt matter ❌ - Delist`)

    const reactions = ['⚔️', '🛡️', '🗡️', '❓', '❌','🚮']

    //Send Message
    const messageReaction = await message.channel.send(rolesEmbed);

    //React
    reactions.forEach(async react => await messageReaction.react(react))
    return messageReaction;
  }
}

