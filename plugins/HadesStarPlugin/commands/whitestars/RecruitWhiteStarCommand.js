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
        return this.roleMessage(message, roles, args.join(' '))
      else
        return message.channel.send("You aren't on your Corporation's server!")
    }
  }

  roleMessage = async (message, role, desc) => {
    message.delete({ timeout: 1 });    //Delete User message

    let description = 'Do you wish to partake in this White Star?';
    if (desc) description = desc

    //Save Message ID
    //Get Whitestart with role
    const ws = await WhiteStar.findOne({ wsrole: role.id }).exec()
    if (!ws) {

      let rolesEmbed = new Discord.MessageEmbed()
        .setTitle(`White Star Recruitment by ${message.author.username}:`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .setDescription(`${description}`)
        .addField("Group:", `<@&${role.id}>`)
        .addField("Current People", "0")
        .addField("Members", "None")
        .setColor("ORANGE")
        .setFooter(`⚔️ - Attack 🛡️ - Guardian 🗡️ - Assassin ❓ - Doesnt matter ❌ - Delist`)

      const reactions = ['⚔️', '🛡️', '🗡️', '❓', '❌']

      //Send Message
      const messageReaction = await message.channel.send(rolesEmbed);

      //React
      reactions.forEach(async react => await messageReaction.react(react))

      //Create new Whitestar
      const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec()
      let newWhiteStar = new WhiteStar({
        _id: new Mongoose.Types.ObjectId(),
        author: message.author.username,
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
      return message.channel.send("A WS is running on that group!")
    }
    //if null create one

    //else

    //Check if there is a WS running with that role
    //Resend message if on (recrut)
    //else send message that RS is already running
  }
}

