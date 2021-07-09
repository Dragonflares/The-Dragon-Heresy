import { MemberCommand } from './MemberCommand';
import { Command } from '../../../../lib';
import { RedStarRoles } from '../../database'
import { id } from 'common-tags';

const { MessageButton, MessageActionRow } = require("discord-buttons")
const Discord = require('discord.js');

export class RecruitRedStarCommand extends MemberCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'recruitrs',
      aliases: ['rrs'],
      description: "Start a RS recruit message. A Time argument in Minutes can be added",
      usage: "&rrs <level> (time)"
    });
  }

  async run(message, args) {
    if (args[0] && (args[0] > 0 && args[0] < 12)) { //If level between 1 and 12
      if (args[1]) {
        if (args[1] >= 5 && args[1] <= 60) {
          message.delete({ timeout: 1 });    //Delete User message
          this.sendInitialMessage(message, args[0], 60000 * args[1]); //Send recuit message
        } else {
          return message.channel.send("Time must be between 5 and 60 minutes")
        }
      } else {
        message.delete({ timeout: 1 });    //Delete User message
        this.sendInitialMessage(message, args[0], 600000); //Send recuit message
      }


    } else {
      return message.channel.send("You must specifiy a valid Red Star level (1-11)")
    }
  }

  async failed(message, registeredPlayers, rsLevel) {

    //Add Reactions to a dictionary
    //If no people write None
    let testString = ""
    registeredPlayers.forEach((value, key) => testString += ` ${key} ${value} \n`)
    if (testString == "") testString = "None";

    //If no people write None
    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `0/0` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"
    newEmbed.setColor("RED")
    newEmbed.setFooter("Closed")
    message.edit({ component: null, embed: newEmbed });

  }

  async updateEmbed(message, rsLevel, registeredPlayers, button) {
    //Variables
    const reacted = registeredPlayers
    let done = false
    //If no people write None
    let testString = ""
    reacted.forEach((value, key) => testString += ` ${key} ${value} \n`)
    if (testString == "") testString = "None";

    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `${reacted.size}/4` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"

    if (reacted.size == 4) {  // Ping people that is done
      newEmbed.setColor("GREEN");
      let testString = ""
      reacted.forEach((value, key) => testString += ` ${key} ${value} ,`)
      testString += `Full Team for RS${rsLevel}!`
      message.channel.send(testString);
      done = true
    } else {
      newEmbed.setColor("ORANGE");
    }
    if(!done)
      message.edit("-",{embed: newEmbed });
    else
      message.edit("-",{embed: newEmbed,component:null });


    
    var link = "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
    let urlbutton = new MessageButton()
    .setStyle('url')
    .setURL(link) 
    .setLabel('Jump to Recruit!'); 
    let sent = await message.channel.send(`There is currently a RS${rsLevel} going with ${reacted.size}/4`,urlbutton)
    return sent;
  }

  async sendInitialMessage(msgObject, rsLevel, timeout) {
    //Variables
    let existentRedStarRoles = await RedStarRoles.findOne({ corpId: msgObject.guild.id.toString() })
    let role = existentRedStarRoles.redStarRoles.get(`${rsLevel}`)

    if (!role) {
      return msgObject.channel.send(`The Role ${rsLevel} wasnt setup by server Administrator`);
    }
    let reactionFilter = (reaction, user) => !user.bot
    var done = false
    var authorName = msgObject.guild.member(msgObject.author).nickname
    if (!authorName) authorName = msgObject.author.username
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`RS ${rsLevel} Recruitment invitation by ${authorName}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role}> \n React below if you have croid or not`)
      .addField("Current People", "0/4")
      .addField("Members", "None")
      .setColor("ORANGE")
      .setFooter(`This invitation will be on for ${timeout / 60000} minutes`)

    let gotCroidButton = new MessageButton()
      .setStyle('green')
      .setLabel('Croid')
      .setID('has_croid')

    let noCroidButton = new MessageButton()
      .setStyle('red')
      .setLabel('No Croid')
      .setID('no_croid')

    let clearButton = new MessageButton()
      .setStyle('grey')
      .setLabel('Out')
      .setID('clear')

    let deleteButton = new MessageButton()
      .setStyle('blurple')
      .setLabel('Delete')
      .setID('delete')
      .setEmoji('🚮')

    let buttonRow = new MessageActionRow()
      .addComponent(gotCroidButton)
      .addComponent(noCroidButton)
      .addComponent(clearButton)
      .addComponent(deleteButton)
    msgObject.channel.send(`<@&${role}>`)
    const messageReaction = await msgObject.channel.send({ component: buttonRow, embed: pollEmbed });
    const filter = (button) => button.clicker.user.bot == false;
    const collector = messageReaction.createButtonCollector(filter, { time: timeout, dispose: true }); //collector for 5 seconds

    let oldMessage
    let registeredPlayers = new Map() // User + Croid or not

    collector.on('collect', async b => {

      if (b.id == "delete") { //When Trash
        if (b.clicker.user.id == msgObject.author.id) {
          done = true
          this.failed(messageReaction, registeredPlayers, rsLevel);
          await b.reply.send('Invitation Deleted', true);
        } else {
          await b.reply.send('You are not the owner of this invitation', true);
        }
      } else if (b.id == "has_croid" || b.id == "no_croid") {
        b.reply.defer()
        if (b.id == "has_croid")
          registeredPlayers.set(b.clicker.user, '✅')
        else
          registeredPlayers.set(b.clicker.user, '❎')
        if (oldMessage) oldMessage.delete({ timeout: 1 });
        oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, b) //Update the Embeed to show the new reaction   
      } else if (b.id == "clear") {
        if (registeredPlayers.has(b.clicker.user)) {
          registeredPlayers.delete(b.clicker.user)
          if (oldMessage) oldMessage.delete({ timeout: 1 });
          oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, b) //Update the Embeed to show the new reaction   
        }
     
      }
      b.reply.defer()
    });

    collector.on('end', collected => {
      this.failed(messageReaction, registeredPlayers, rsLevel);
    });
  }
}

