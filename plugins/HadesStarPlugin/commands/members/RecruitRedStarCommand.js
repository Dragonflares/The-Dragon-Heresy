import { MemberCommand } from './MemberCommand';
import { RedStarRoles, RedStarQueue, Corp, RedStarLog} from '../../database'
const { MessageButton, MessageActionRow } = require("discord-buttons")
const Discord = require('discord.js');
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
      if(!time || time < 1 || time > 60 || isNaN(time)) 
        time = 600000   // If time is not a number or between 1 and 60 time is 10 min
      else
        time *= 60000
      this.sendInitialMessage(message, level , time);                   // Send recuit message
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
        var authorName = msgObject.guild.member(msgObject.author).nickname
        if (!authorName) authorName = msgObject.author.username

        //Create Message
        let pollEmbed = new Discord.MessageEmbed()
        .setTitle(`RS ${rsLevel} Recruitment invitation by ${authorName}:`)
        .setThumbnail("https://i.imgur.com/hedXFRd.png")
        .setDescription(`Do you want to be part of this Red Star? <@&${role}> \n Click below if you need your croid or not`)
        .addField("Current People", "0/4")
        .addField("Members", "None")
        .setColor("ORANGE")
        .setFooter(`This invitation will be on for ${timeout / 60000} minutes`)

        // Add Buttons
        let styles = ['green', 'red', 'blurple','green']
        let labels = ['Croid', 'No Croid', '','']
        let ids = ['has_croid', 'no_croid', 'delete','done']
        let emojis = ['', '', '🚮','✅']
        let buttonRow = new MessageActionRow()

        let styles1 = ['grey', 'grey']
        let labels1 = ['+1', '+2']
        let ids1 = ['plusOne', 'plusTwo']
        let emojis1 = ['', '']
        let buttonRow1 = new MessageActionRow()

        for (let i = 0; i < styles.length; i++) {
        let button = new MessageButton()
            .setStyle(styles[i])
            .setLabel(labels[i])
            .setID(ids[i])
        if (emojis[i] != '')
            button.setEmoji(emojis[i])
        buttonRow.addComponent(button);
        }

        for (let i = 0; i < styles1.length; i++) {
        let button = new MessageButton()
            .setStyle(styles1[i])
            .setLabel(labels1[i])
            .setID(ids1[i])
        if (emojis1[i] != '')
            button.setEmoji(emojis1[i])
        buttonRow1.addComponent(button);
        }


        // Send message and save reaction
        const messageReaction = await msgObject.channel.send(`<@&${role}>`, { components: [buttonRow,buttonRow1], embed: pollEmbed });
        
        // Create button collector for the message
        const filter = (button) => button.clicker.user.bot == false;
        const collector = messageReaction.createButtonCollector(filter);

        //Create map of registered players and self incude
        let registeredPlayers = new Map()
        let extraPlayers = new Map()
        registeredPlayers.set(msgObject.author.id, '❎')

        //Save time to timeout
        let timeToTimeout = new Date(new Date().getTime() + timeout);

        // Open a new RedstarQueue
        const corp = await Corp.findOne({ corpId: messageReaction.guild.id.toString() }).exec()
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
            text:""
        })

        // CurrentStatusMessage
        let currentStatusMessage = null
        if(newRedStarQueue.currentStatusMessage)
             currentStatusMessage = await this.client.channels.cache.get(newRedStarQueue.recruitChannel).messages.fetch(newRedStarQueue.currentStatusMessage.toString());    
        if (currentStatusMessage) currentStatusMessage.delete({ timeout: 1 });
        currentStatusMessage = await RsQueuesUtils.updateEmbed(this.client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   

        // Save
        newRedStarQueue.currentStatusMessage=currentStatusMessage.id;
        await newRedStarQueue.save();

        // Listen to buttons
        collector.on('collect', async b => {
           RsQueuesUtils.collectorFunc(this.client, messageReaction, newRedStarQueue, b)
        });
    }

}