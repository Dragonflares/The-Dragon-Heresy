import { Command } from '../../../../lib';
const Discord = require('discord.js');


export class RecruitRedStarCommand extends Command {
  constructor(plugin) {
    super(plugin, {
      name: 'recruitrs',
      aliases: ['rrs'],
      description: "Start a RS recruit message.",
      usage: "&rrs RSNUM"
    });
  }

  async run(message, args) {
    const tech = message.content.split(" ")
    if (tech[1]) {
      if (tech[1] > 0 && tech[1] < 12) { //If level between 1 and 12
          return this.startMessage(this.client, message, tech[1], 600000) // Start with 10 minutes timout
      } else {
        return message.channel.send("Please add a valid Red Star Level. (1-11)")
      }
    } else {
      return message.channel.send("You must specifiy a valid Red Star level. A timeout can be added. &rrs num [timeout]")
    }
  }
  async startMessage(client, msgObject, rsLevel, timeout) {
    msgObject.delete({ timeout: 1 });    //Delete User message
    this.SendInitialMessage(msgObject, rsLevel, timeout); //Send recuit message
  }

  async Failed(message, rsLevel,messageAutor) {
    var amm = 0;
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
        if (Reacted[key] == "✅" || Reacted[key] == "❎") {
          amm++;
          testString += `${key} ${Reacted[key]}`
        }
      }
    });
    if (amm < 4) {
      //If no people write None
      if (testString == "") testString = "None";
      let role = message.guild.roles.cache.find(role => role.name === `RS${rsLevel}`);
      let newEmbed = new Discord.MessageEmbed()
        .setTitle(`@RS${rsLevel} Recruitment:`)
        .setDescription(`Do you want to be part of this Red Star? <@&${role.id}> \n React below if you have croid or not`)
        .addField("Current People", `${amm}/4 Closed`)
        .addField("Members", ` ${testString}\n Closed`)
      newEmbed.setColor("RED")
      message.edit(newEmbed)
    }
  }

  async UpdateEmbed(message, rsLevel,messageAutor) {
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
        if (Reacted[key] == "✅" || Reacted[key] == "❎") {
          amm++;
          testString += `${key} ${Reacted[key]} \n`
        }
      }
    });

    //If no people wirte None
    if (testString == "") testString = "None";
    let role = message.guild.roles.cache.find(role => role.name === `RS${rsLevel}`);

    let newEmbed = new Discord.MessageEmbed()
      .setTitle(`@RS${rsLevel} Recruitment invitation by ${messageAutor.username}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role.id}> \n React below if you have croid or not`)
      .addField("Current People", `${amm}/4`)
      .addField("Members", testString)
      .setFooter("This invitation will be on for 10 minutes")

    if (amm == 4)  newEmbed.setColor("GREEN"); else  newEmbed.setColor("ORANGE"); //Set Color to Green when All Ready
    message.edit(newEmbed) // Send Edit

    if (amm == 4) {
      done[message.id] = true;
      // Ping people that is done
      let testString = ""
      Object.keys(Reacted).forEach(function (key) {
        if (!key.bot) {
          if (Reacted[key] == "✅" || Reacted[key] == "❎") {
            amm++;
            testString += `${key}, `
          }
        }
      })
      if (testString == "") testString = "None"
      else
        testString += `Full Team for RS${rsLevel}!`
      message.reactions.removeAll()
      message.channel.send(testString);
    }
  }

  async SendInitialMessage(msgObject, rsLevel, timeout) {

    let role = msgObject.guild.roles.cache.find(role => role.name === `RS${rsLevel}`);
   
    let pollEmbed = new Discord.MessageEmbed()
      .setTitle(`RS ${rsLevel} Recruitment invitation by ${msgObject.author.username}:`)
      .setThumbnail("https://i.imgur.com/hedXFRd.png")
      .setDescription(`Do you want to be part of this Red Star? <@&${role.id}> \n React below if you have croid or not`)
      .addField("Current People", "0/4")
      .addField("Members", "None")
      .setColor("ORANGE")
      .setFooter("This invitation will be on for 10 minutes")

    let reactionFilter = (reaction, user) =>    !user.bot
    const time = timeout
    var messageAutor = msgObject.author
    var done = false
    msgObject.channel.send(pollEmbed).then(async messageReaction => {
      await messageReaction.react('✅') //Send Initial Reaction
      await messageReaction.react('❎') //Send Initial Reaction
      await messageReaction.react('🚮') //Send Initial Reaction

      let collector = messageReaction.createReactionCollector(reactionFilter, { time: time, dispose: true });
      collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name == "🚮") { //When Trash
          if (user.id == messageAutor.id) {

            reaction.users.remove(user);
            done = true
            messageReaction.reactions.removeAll()
            this.Failed(messageReaction, rsLevel);
          }
        } else {
          if (reaction.emoji.name != '✅' && reaction.emoji.name != '❎') { // If its not V or X
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
              this.UpdateEmbed(messageReaction, rsLevel,messageAutor) //Update the Embeed to show the new reaction
            }
          }
        }
      });
      collector.on('remove', (reaction, reactionCollector) => { // When a reaction is removed
        if (done == false)
          this.UpdateEmbed(messageReaction, rsLevel,messageAutor)
      });

      collector.on('end', (reaction, reactionCollector) => { // When timeout done
        messageReaction.reactions.removeAll()
        this.Failed(messageReaction, rsLevel,messageAutor);
      });
    })
  }

}

