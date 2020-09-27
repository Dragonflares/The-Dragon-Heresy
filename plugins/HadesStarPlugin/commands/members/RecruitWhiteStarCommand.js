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
    const tech = message.content.split(" ")
    return this.startMessage(this.client, message) //Send Message
  }
  async startMessage(client, msgObject) {
    msgObject.delete({ timeout: 1 });    //Delete User message
    this.SendInitialMessage(msgObject); //Send recuit message
  }

  async UpdateEmbed(message,messageAutor) {
    let amm = 0;

    //Clear Reactions Dictionary
    var Reacted = {}

    //Add Reactions to a dictionary
    let testString = ""
    message.reactions.cache.forEach(reaction =>
      reaction.users.cache.forEach(user =>
        Reacted[user] = reaction.emoji.name
      ))

    // Create Users Text and Count People In
    Object.keys(Reacted).forEach(function (key) {
      if (!key.bot) {
        if (Reacted[key] == "⚔️" || Reacted[key] == "🛡️" || Reacted[key] == "🗡️" || Reacted[key] == "❓") {
          amm++;
          testString += `${key} ${Reacted[key]} \n`
        }
      }
    });

    //If no people wirte None
    if (testString == "") testString = "None";
    let role = message.guild.roles.cache.find(role => role.name === `White Star`);

    let newEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${messageAutor.username}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`Do you wish to partake in this White Star? <@&${role.id}>`)
      .addField("Current People",  `${amm}/15`)
      .addField("Members", `${testString}`)
      .setColor("ORANGE")


    if (amm == 15)  newEmbed.setColor("GREEN"); else  newEmbed.setColor("ORANGE"); //Set Color to Green when All Ready
    message.edit(newEmbed) // Send Edit

    if (amm == 15) {
      done[message.id] = true;
      // Ping people that is done
      let testString = ""
      Object.keys(Reacted).forEach(function (key) {
        if (!key.bot) {
          if (Reacted[key] == "⚔️" || Reacted[key] == "🛡️" || Reacted[key] == "🗡️" || Reacted[key] == "❓") {
            testString += `${key}, `
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

  async SendInitialMessage(msgObject) {

    let role = msgObject.guild.roles.cache.find(role => role.name === `White Star`);
   
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`White Star Recruitment by ${msgObject.author.username}:`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setDescription(`Do you wish to partake in this White Star? <@&${role.id}>`)
      .addField("Current People", "0/15")
      .addField("Members", "None")
      .setColor("ORANGE")

    let reactionFilter = (reaction, user) =>    !user.bot
   // const time = timeout
    var messageAutor = msgObject.author
    var done = false
    msgObject.channel.send(pollEmbed).then(async messageReaction => {
      await messageReaction.react('⚔️') //Send Initial Reaction
      await messageReaction.react('🛡️') //Send Initial Reaction
      await messageReaction.react('🗡️') //Send Initial Reaction
      await messageReaction.react('❓') //Send Initial Reaction

      let collector = messageReaction.createReactionCollector(reactionFilter, { dispose: true });
      collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name == "🚮") { //When Trash
          if (user.id == messageAutor.id) {

            reaction.users.remove(user);
            done = true
            messageReaction.reactions.removeAll()
            this.Failed(messageReaction, rsLevel);
          }
        } else {
          if (reaction.emoji.name != '⚔️' && reaction.emoji.name != '🛡️' && reaction.emoji.name != '🗡️' && reaction.emoji.name != '❓') { // If its not wanted reaction
            reaction.remove() // Remove the Reaction
          } else {
            var Reacted = {}
            messageReaction.reactions.cache.forEach(reaction =>
              reaction.users.cache.forEach(user =>
                (user in Reacted) ? Reacted[user]++ : Reacted[user] = 0
              )) // Get Every Reaction

            if (Reacted[user] > 0) { // If User has already a reacion
              reaction.users.remove(user); // Remove it
            } else {
              this.UpdateEmbed(messageReaction,messageAutor) //Update the Embeed to show the new reaction
            }
          }
        }
      });
      collector.on('remove', (reaction, reactionCollector) => { // When a reaction is removed
        if (done == false)
          this.UpdateEmbed(messageReaction,messageAutor)
      });

    })
  }

}

