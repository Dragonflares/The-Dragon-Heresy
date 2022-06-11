import { MemberCommand } from './MemberCommand';
import { RedStarRoles, RedStarQueue, Corp, RedStarLog } from '../../database'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js';
import Mongoose from 'mongoose'
import * as RsQueuesUtils from '../../utils/redStarsQueuesUtils'

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

    // Delete command
    message.delete({ timeout: 1 });

    // Get Arguments
    let level = args[0]
    let time = args[1]

    if (level && (level > 0 && level < 12)) {                           // If level between 1 and 12
      if (!time || time < 1 || time > 60 || isNaN(time))
        time = 600000   // If time is not a number or between 1 and 60 time is 10 min
      else
        time *= 60000
      this.sendInitialMessage(message, level, time);                   // Send recuit message
    } else {
      return message.channel.send("You must specifiy a valid Red Star level (1-11)")
    }
  }

  async sendInitialMessage(msgObject, rsLevel, timeout) {
    //Make sure role exists
    let existentRedStarRoles = await RedStarRoles.findOne({ corpId: msgObject.guild.id.toString() })
    let role = existentRedStarRoles.redStarRoles.get(`${rsLevel}`)
    if (!role) return msgObject.channel.send(`The Role ${rsLevel} wasnt setup by server Administrator`);

    //Get Author Name
    var authorName = msgObject.guild.members.fetch(msgObject.author).nickname
    if (!authorName) authorName = msgObject.author.username

    //Check if there is an RS with that level already open
    const corp = await Corp.findOne({ corpId: msgObject.guild.id.toString() }).exec()
    let rsQueues = await RedStarQueue.find({ corp: corp._id, rsLevel: rsLevel }).exec();
    if (rsQueues.length > 0) {
      var link = "http://discordapp.com/channels/" + msgObject.guild.id + "/" + rsQueues[0].recruitChannel + "/" + rsQueues[0].recruitMessage;

      //Make row
      let buttonRow = new MessageActionRow()
      //Make buttons
      let buttonCancel = new MessageButton()
        .setStyle(4)
        .setLabel("Cancel")
        .setCustomId("Cancel")

      let buttonJump = new MessageButton()
        .setStyle(5)
        .setURL(link)
        .setLabel("Jump to it")

      let buttonSave = new MessageButton()
        .setStyle(3)
        .setLabel("Open")
        .setCustomId("Open")

      buttonRow.addComponents(buttonCancel);
      buttonRow.addComponents(buttonJump);
      buttonRow.addComponents(buttonSave);

      let textMsg = `There is another <@&${role}> queue running, are you sure you want to open a new one?`
      let messageReaction = await msgObject.channel.send({ content: textMsg, components: [buttonRow], ephemeral: true });
      const filter = i => i.user.id === msgObject.author.id;
      try {
        const i = await messageReaction.channel.awaitMessageComponent({ filter, time: 15000 }).catch();
        if (i.customId == "Cancel") {
          throw new Error();
        } else {
          messageReaction.delete({ timeout: 1 })
          i.deferUpdate();
        }
      } catch (err) {
        messageReaction.delete({ timeout: 1 })
        return false;
      }
    }

    //Create Message
    let pollEmbed = new MessageEmbed()
      .setTitle(`RS ${rsLevel} Recruitment invitation by ${authorName}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role}> \n Click below if you need your croid or not`)
      .addField("Current People", "0/4")
      .addField("Members", "None")
      .setColor("ORANGE")
      .setFooter({ text: `This invitation will be on for ${timeout / 60000} minutes` })

    // Add Buttons
    let styles = [3, 4, 1, 3] //1 blue  2 gray 3 green 4 red
    let labels = ['Croid', 'No Croid', '', '']
    let ids = ['has_croid', 'no_croid', 'delete', 'done']
    let emojis = ['', '', '🚮', '✅']
    let buttonRow = new MessageActionRow()

    let styles1 = [2, 2]
    let labels1 = ['+1', '+2']
    let ids1 = ['plusOne', 'plusTwo']
    let emojis1 = ['', '']
    let buttonRow1 = new MessageActionRow()


    let butlen = styles.length
    if (rsLevel < 3) butlen -= 1;

    for (let i = 0; i < butlen; i++) {
      let button = new MessageButton()
        .setStyle(styles[i])
        .setLabel(labels[i])
        .setCustomId(ids[i])
      if (emojis[i] != '')
        button.setEmoji(emojis[i])
      buttonRow.addComponents(button);
    }

    for (let i = 0; i < styles1.length; i++) {
      let button = new MessageButton()
        .setStyle(styles1[i])
        .setLabel(labels1[i])
        .setCustomId(ids1[i])
      if (emojis1[i] != '')
        button.setEmoji(emojis1[i])
      buttonRow1.addComponents(button);
    }

    let messageReaction
    if (rsLevel > 2)
      // Send message and save reaction
      messageReaction = await msgObject.channel.send({ content: `<@&${role}>`, components: [buttonRow, buttonRow1], embeds: [pollEmbed] });
    else
      messageReaction = await msgObject.channel.send({ content: `<@&${role}>`, components: [buttonRow], embeds: [pollEmbed] });
    // Create button collector for the message
    const filter = (button) => button.user.bot == false;
    const collector = messageReaction.createMessageComponentCollector(filter);

    //Create map of registered players and self incude
    let registeredPlayers = new Map()
    let extraPlayers = new Map()
    registeredPlayers.set(msgObject.author.id, '❎')

    //Save time to timeout
    let timeToTimeout = new Date(new Date().getTime() + timeout);

    // Open a new RedstarQueue

    let newRedStarQueue = new RedStarQueue({
      _id: new Mongoose.Types.ObjectId(),
      author: msgObject.author.id,
      Corp: corp,
      timeOpened: new Date(),
      length: timeout,
      timeToTimeout: timeToTimeout,
      rsLevel: rsLevel,
      registeredPlayers: registeredPlayers,
      extraPlayers: new Map(),
      recruitMessage: messageReaction.id.toString(),
      currentStatusMessage: null,
      recruitChannel: messageReaction.channel.id.toString(),
      text: ""
    })


    let sendData = await RsQueuesUtils.updateEmbed(this.client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   
    
    if(sendData)
    await RsQueuesUtils.sendStatusMsg(this.client,messageReaction,newRedStarQueue)
    

    await newRedStarQueue.save();

    // Listen to buttons
    collector.on('collect', async b => {
      RsQueuesUtils.collectorFunc(this.client, messageReaction, newRedStarQueue, b)
    });
  }

}