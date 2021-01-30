import { MemberCommand } from './MemberCommand';
import { Command } from '../../../../lib';
import { RedStarRoles } from '../../database'
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

  async failed(message, rsLevel) {
    //Add Reactions to a dictionary
    let testString = ""
    message.reactions.cache.forEach(reaction =>
      reaction.users.cache.forEach(user => {
        if (!user.bot) {
          if (reaction.emoji.name == "✅" || reaction.emoji.name == "❎") {
            testString += `${user} ${reaction.emoji.name}`
          }
        }
      }))
    if (testString == "") testString = "None";

    //If no people write None
    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `0/0` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"
    newEmbed.setColor("RED")
    newEmbed.setFooter("Closed")
    message.edit(newEmbed)
  }

  async updateEmbed(message, rsLevel) {
    //Variables
    const reacted = new Map();

    //Add Reactions to a dictionary
    message.reactions.cache.forEach(reaction =>
      reaction.users.cache.forEach(user => {
        if (!user.bot) {
          if (reaction.emoji.name == "✅" || reaction.emoji.name == "❎") {
            reacted.set(user, reaction.emoji.name);
          }
        }
      }
      ))

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
      message.reactions.removeAll()
      message.channel.send(testString);
    } else {
      newEmbed.setColor("ORANGE");
    }
    message.edit(newEmbed) // Send Edit
    var link = "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
    let sent = await message.channel.send(`There is currently a RS${rsLevel} going with ${reacted.size}/4!: ${link}`)
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
    msgObject.channel.send(`<@&${role}>`);
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`RS ${rsLevel} Recruitment invitation by ${msgObject.guild.member(msgObject.author).nickname}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role}> \n React below if you have croid or not`)
      .addField("Current People", "0/4")
      .addField("Members", "None")
      .setColor("ORANGE")
      .setFooter(`This invitation will be on for ${timeout / 60000} minutes`)

    const messageReaction = await msgObject.channel.send(pollEmbed);
    await messageReaction.react('✅') //Send Initial Reaction
    await messageReaction.react('❎') //Send Initial Reaction
    await messageReaction.react('🚮') //Send Initial Reaction

    let collector = messageReaction.createReactionCollector(reactionFilter, { time: timeout, dispose: true });
    let oldMessage
    collector.on('collect', async (reaction, user) => {
      if (done == true) reaction.remove();
      else
        if (reaction.emoji.name == "🚮") { //When Trash
          if (user.id == msgObject.author.id) {
            done = true
            messageReaction.reactions.removeAll()
            this.failed(messageReaction, rsLevel);
          }
        } else {
          if (reaction.emoji.name != '✅' && reaction.emoji.name != '❎') { // If its not V or X
            reaction.remove() // Remove the Reaction
          } else {
            var reacted = {}
            messageReaction.reactions.cache.forEach(reaction =>
              reaction.users.cache.forEach(user =>
                (user in reacted) ? reacted[user]++ : reacted[user] = 0
              )) // Get Every Reaction

            if (reacted[user] > 0) { // If User has already a reacion
              reaction.users.remove(user); // Remove it
            } else {
              if (oldMessage) oldMessage.delete({ timeout: 1 });
              oldMessage = await this.updateEmbed(messageReaction, rsLevel) //Update the Embeed to show the new reaction
            }
          }
        }
    });

    collector.on('remove', async (reaction, reactionCollector) => { // When a reaction is removed
      if (done == false) {
        if (oldMessage) oldMessage.delete({ timeout: 1 });
        oldMessage = await this.updateEmbed(messageReaction, rsLevel)
      }
    });

    collector.on('end', (reaction, reactionCollector) => { // When timeout done
      messageReaction.reactions.removeAll()
      this.failed(messageReaction, rsLevel);
    });
  }
}

