import { MemberCommand } from './MemberCommand';
import { RedStarRoles } from '../../database'
const { MessageButton, MessageActionRow } = require("discord-buttons")
const Discord = require('discord.js');

export class RecruitRedStarCommand extends MemberCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'recruitrs',
      aliases: ['rrs', 'rs'],
      description: "Start a RS recruit message. A Time argument in Minutes can be added",
      usage: "&rs <level> (time)"
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


  async failed(message, registeredPlayers, extra) {
    //Add Reactions to a dictionary
    //If no people write None
    let testString = ""
    registeredPlayers.forEach((value, key) => {
      let tx = ""
      if (extra.has(key)) tx = `**+${extra.get(key)}**`
      testString += ` ${key} ${value} ${tx} (${key.username})\n`
    })
    if (testString == "") testString = "None";

    //If no people write None
    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `0/0` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"
    newEmbed.setColor("RED")
    newEmbed.setFooter("Closed")
    message.edit({ component: null, embed: newEmbed });

  }


  async updateEmbed(message, rsLevel, registeredPlayers, extra) {
    //Variables
    const reacted = registeredPlayers
    //If no people write None
    let testString = ""
    reacted.forEach((value, key) => {
      let tx = ""
      if (extra.has(key)) tx = `**+${extra.get(key)}**`
      testString += ` ${key} ${value} ${tx} (${key.username})\n`
    })
    if (testString == "") testString = "None";

    let newEmbed = new Discord.MessageEmbed(message.embeds[0])

    let currentPeopleAmm = reacted.size
    extra.forEach((value, key) => currentPeopleAmm += value)

    newEmbed.fields[0].value = `${currentPeopleAmm}/4` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"

    if (currentPeopleAmm == 4) {  // Ping people that is done
      newEmbed.setColor("GREEN");
      let testString = ""
      reacted.forEach((value, key) => {
        let tx =""
        if (extra.has(key)) tx = `**+${extra.get(key)}**`
        testString += ` ${key} ${value} ${tx},`
      })
      testString += ` Full Team for RS${rsLevel}!`
      message.channel.send(testString);
      message.edit(newEmbed, null);
    } else {
      newEmbed.setColor("ORANGE");
      message.edit(newEmbed);
    }

    var link = "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
    let urlbutton = new MessageButton()
      .setStyle('url')
      .setURL(link)
      .setLabel('Jump to Recruit!');
    let sent = await message.channel.send(`There is currently a RS${rsLevel} going with ${currentPeopleAmm}/4`, urlbutton)
    return sent;
  }

  async sendInitialMessage(msgObject, rsLevel, timeout) {
    //Make sure role exists
    let existentRedStarRoles = await RedStarRoles.findOne({ corpId: msgObject.guild.id.toString() })
    let role = existentRedStarRoles.redStarRoles.get(`${rsLevel}`)

    if (!role) {
      return msgObject.channel.send(`The Role ${rsLevel} wasnt setup by server Administrator`);
    }
    let reactionFilter = (reaction, user) => !user.bot
    var authorName = msgObject.guild.member(msgObject.author).nickname
    if (!authorName) authorName = msgObject.author.username
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`RS ${rsLevel} Recruitment invitation by ${authorName}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role}> \n Click below if you have croid or not`)
      .addField("Current People", "0/4")
      .addField("Members", "None")
      .setColor("ORANGE")
      .setFooter(`This invitation will be on for ${timeout / 60000} minutes`)


    // Add Buttons
    let styles = ['green', 'red', 'grey', 'grey', 'blurple']
    let labels = ['Croid', 'No Croid', '+1', '+2', '']
    let ids = ['has_croid', 'no_croid', 'plusOne', 'plusTwo', 'delete']
    let emojis = ['', '', '', '', '🚮']
    let buttonRow = new MessageActionRow()

    for (let i = 0; i < styles.length; i++) {
      let button = new MessageButton()
        .setStyle(styles[i])
        .setLabel(labels[i])
        .setID(ids[i])
      if (emojis[i] != '')
        button.setEmoji(emojis[i])
      buttonRow.addComponent(button);
    }


    msgObject.channel.send(`<@&${role}>`)

    const messageReaction = await msgObject.channel.send({ components: [buttonRow], embed: pollEmbed });
    const filter = (button) => button.clicker.user.bot == false;
    const collector = messageReaction.createButtonCollector(filter, { time: timeout, dispose: true }); //collector for 5 seconds

    let oldMessage
    let registeredPlayers = new Map() // User + Croid or not
    let extraPlayers = new Map()

    registeredPlayers.set(msgObject.author, '❎')
    if (oldMessage) oldMessage.delete({ timeout: 1 });
    oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   


    collector.on('collect', async b => {

      //Delete queue
      if (b.id == "delete") { //When Trash
        if (b.clicker.user.id == msgObject.author.id) {
          this.failed(messageReaction, registeredPlayers, extraPlayers);
          return await b.reply.send('Invitation Deleted', true);
        }
        return await b.reply.send('You are not the owner of this invitation', true);
      }


      // Get out of queue
      let hadCroidAndClickCroid = b.id == "has_croid" && registeredPlayers.has(b.clicker.user) && registeredPlayers.get(b.clicker.user) == '✅'
      let noCroidAndClockNoCroid = b.id == "no_croid" && registeredPlayers.has(b.clicker.user) && registeredPlayers.get(b.clicker.user) == '❎'

      if (hadCroidAndClickCroid || noCroidAndClockNoCroid) {
        extraPlayers.delete(b.clicker.user)
        registeredPlayers.delete(b.clicker.user)
        await b.reply.send('You out of the queue', true);
        if (oldMessage) oldMessage.delete({ timeout: 1 });
        return oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   
      }

      //Get in queue
      if (b.id == "has_croid" || b.id == "no_croid") {
        if (b.id == "has_croid")
          registeredPlayers.set(b.clicker.user, '✅')
        else
          registeredPlayers.set(b.clicker.user, '❎')

        if (oldMessage) oldMessage.delete({ timeout: 1 });
        oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   
        return b.reply.defer()
      }

      //Unregister plus one/tro
      let plusOneClickPlusOne = b.id == "plusOne" && extraPlayers.has(b.clicker.user) && extraPlayers.get(b.clicker.user) == 1
      let plusTwoClickPlusTwo = b.id == "plusTwo" && extraPlayers.has(b.clicker.user) && extraPlayers.get(b.clicker.user) == 2

      if (plusOneClickPlusOne || plusTwoClickPlusTwo) {
        extraPlayers.delete(b.clicker.user)
        await b.reply.send('Unregistered plus player/s', true);
        if (oldMessage) oldMessage.delete({ timeout: 1 });
        return oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   
      }

      // add plusone/two
      let currentPeopleAmm = registeredPlayers.size
      extraPlayers.forEach((value, key) => currentPeopleAmm += value)

      if (registeredPlayers.has(b.clicker.user)) {
        if (b.id == "plusOne") {
          if (currentPeopleAmm > 3) return await b.reply.send('Too many players', true);
          extraPlayers.set(b.clicker.user, 1)
          if (oldMessage) oldMessage.delete({ timeout: 1 });
          oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   
        } else if (b.id == "plusTwo") {
          if (currentPeopleAmm > 2) return await b.reply.send('Too many players', true);
          extraPlayers.set(b.clicker.user, 2)
          if (oldMessage) oldMessage.delete({ timeout: 1 });
          oldMessage = await this.updateEmbed(messageReaction, rsLevel, registeredPlayers, extraPlayers) //Update the Embeed to show the new reaction   
        }
        b.reply.defer()
      }

    });

    collector.on('end', collected => {
      this.failed(messageReaction, registeredPlayers, extraPlayers);
    });
  }
}

