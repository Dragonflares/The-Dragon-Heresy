import { Command } from '../../../../lib';
import { id } from 'common-tags';
const Discord = require('discord.js');

export class RecruitWhiteStarCommand extends Command {
  constructor(plugin) {
    super(plugin, {
      name: 'recruitws',
      aliases: ['rws'],
      description: "Start a White Star recruit message.",
      usage: "&rws"
    });
  }

  async run(message, args) {
    message.delete({ timeout: 1 });    //Delete User message
    this.sendInitialMessage(message); //Send recuit message
  }

  async updateEmbed(message) {
    //Variables
    const reacted = new Map();

    //Create Users Text and Count People In , Add Reactions to a dictionary
    message.reactions.cache.forEach(reaction =>
      reaction.users.cache.forEach(user => {
        if (!user.bot) {
          if (reaction.emoji.name == "⚔️" || reaction.emoji.name == "🛡️" || reaction.emoji.name == "🗡️" || reaction.emoji.name == "❓") {
            reacted.set(user, reaction.emoji.name);
          }
        }
      }))

    //If no people write None
    let testString = ""
    reacted.forEach((value, key) => testString += ` ${key} ${value} \n`)
    if (testString == "") testString = "None";

    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `${reacted.size}/15` //"Current People"
    newEmbed.fields[1].value = `${testString}` //"Members"

    if (reacted.size == 15) {  // Ping people that is done
      newEmbed.setColor("GREEN")
      let testString = ""
      reacted.forEach((value, key) => testString += ` ${key} ${value} ,`)
      testString += ` Full Team for White Star!`
      message.reactions.removeAll()
      message.channel.send(testString);
    }else{
      newEmbed.setColor("ORANGE");
    }
    message.edit(newEmbed) // Send Edit
  }

  async sendInitialMessage(msgObject) {
    //Variables
    let role = msgObject.guild.roles.cache.find(role => role.name === `White Star`);
    let reactionFilter = (reaction, user) => !user.bot
    var done = false

    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${msgObject.author.username}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`Do you wish to partake in this White Star? <@&${role.id}>`)
      .addField("Current People", "0/15")
      .addField("Members", "None")
      .setColor("ORANGE")

    const messageReaction = await msgObject.channel.send(pollEmbed);
    await messageReaction.react('⚔️') //Send Initial Reaction
    await messageReaction.react('🛡️') //Send Initial Reaction
    await messageReaction.react('🗡️') //Send Initial Reaction
    await messageReaction.react('❓') //Send Initial Reaction


    let collector = messageReaction.createReactionCollector(reactionFilter, { dispose: true });
    collector.on('collect', (reaction, user) => {
      if(done ==  true)   reaction.remove();
      else if (reaction.emoji.name == "🚮") { //When Trash
        if (user.id == msgObject.author.id) {
          done = true
          messageReaction.reactions.removeAll()
          this.failed(messageReaction, rsLevel);
        }
      } else {
        if (reaction.emoji.name != '⚔️' && reaction.emoji.name != '🛡️' && reaction.emoji.name != '🗡️' && reaction.emoji.name != '❓') { // If its not wanted reaction
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
            this.updateEmbed(messageReaction) //Update the Embeed to show the new reaction
          }
        }
      }
    });
    
    collector.on('remove', (reaction, reactionCollector) => { // When a reaction is removed
      if (done == false) this.updateEmbed(messageReaction)
    });
  }
}

