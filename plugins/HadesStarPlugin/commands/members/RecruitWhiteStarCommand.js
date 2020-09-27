import { Command } from '../../../../lib';
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
    return this.startMessage(message) //Send Message
  }
  async startMessage(msgObject) {
    msgObject.delete({ timeout: 1 });    //Delete User message
    this.sendInitialMessage(msgObject); //Send recuit message
  }

  async updateEmbed(message, messageAutor) {
    //Variables
    let amm = 0;
    let reacted = {}
    let testString = ""
    const role = message.guild.roles.cache.find(role => role.name === `White Star`);

    //Create Users Text and Count People In , Add Reactions to a dictionary
    message.reactions.cache.forEach(reaction =>
      reaction.users.cache.forEach(user => {
        reacted[user] = reaction.emoji.name
        if (!user.bot) {
          if (reaction.emoji.name == "⚔️" || reaction.emoji.name == "🛡️" || reaction.emoji.name == "🗡️" || reaction.emoji.name == "❓") {
            amm++;
            testString += `${user} ${reaction.emoji.name} \n`
          }
        }
      }))

    //If no people write None
    if (testString == "") testString = "None";
    
    let newEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${messageAutor.username}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`Do you wish to partake in this White Star? <@&${role.id}>`)
      .addField("Current People", `${amm}/15`)
      .addField("Members", `${testString}`)
      .setColor("ORANGE")


    if (amm == 15) newEmbed.setColor("GREEN"); else newEmbed.setColor("ORANGE"); //Set Color to Green when All Ready
    message.edit(newEmbed) // Send Edit

    if (amm == 15) {
      done[message.id] = true;
      // Ping people that is done
      let testString = ""
      reacted.forEach(user => {
        if (!user.bot) {
          if (reacted[user] == "⚔️" || reacted[user] == "🛡️" || reacted[user] == "🗡️" || reacted[user] == "❓") {
            testString += `${user}, `
          }
        }
      })
      if (testString == "")
        testString = "None"
      else
        testString += `Full Team for White Star!`
      message.reactions.removeAll()
      message.channel.send(testString);
    }
  }

  async sendInitialMessage(msgObject) {

    let role = msgObject.guild.roles.cache.find(role => role.name === `White Star`);

    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${msgObject.author.username}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`Do you wish to partake in this White Star? <@&${role.id}>`)
      .addField("Current People", "0/15")
      .addField("Members", "None")
      .setColor("ORANGE")

    let reactionFilter = (reaction, user) => !user.bot
    var done = false
    const messageReaction = await msgObject.channel.send(pollEmbed);
    await messageReaction.react('⚔️') //Send Initial Reaction
    await messageReaction.react('🛡️') //Send Initial Reaction
    await messageReaction.react('🗡️') //Send Initial Reaction
    await messageReaction.react('❓') //Send Initial Reaction

    let collector = messageReaction.createReactionCollector(reactionFilter, { dispose: true });
    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name == "🚮") { //When Trash
        if (user.id == msgObject.author.id) {

          reaction.users.remove(user);
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
            this.updateEmbed(messageReaction, msgObject.author) //Update the Embeed to show the new reaction
          }
        }
      }
    });
    collector.on('remove', (reaction, reactionCollector) => { // When a reaction is removed
      if (done == false)
        this.updateEmbed(messageReaction, msgObject.author)
    });
  }
}

