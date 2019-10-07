const { Client, Collection } = require('discord.js');
const Discord = require('discord.js')
const client = new Client()
const {
    prefix,
    token,
    youtubeToken
}= require("./auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)
const fs = require('fs')
let xp = require('./xp.json')

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");

const queue = new Map();

// Run the command loader
["commands"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on('ready', () => {
    console.log("I need a new job, yet I logged in as " + client.user.tag)
    client.user.setActivity("Space Engineers")
    client.guilds.forEach((guild) => {
        console.log(guild.name, guild.id)
    })
})

client.on('guildMemberAdd', member => {
    console.log(`New member: ${member.user.tag}`)
    const channel = member.guild.systemChannel
    if (!channel) {
        return console.log('channel doesnt exist')
    }
    channel.send(`Welcome ${member}! Feel free to read the RuleSet in the Rules channel and feel free to join any of our common chat channels, we are very happy to have you around. Come and say hi!`)
})

client.on("message", async message => {
    


    if (message.author.bot) return;
    if (!message.guild) return;
    triggerXp(message)
    if (!message.content.startsWith(prefix)) return;


    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) 
        command.run(client, message, args, queue);
});


async function triggerXp(receivedMessage)
{
    if(!xp[receivedMessage.guild.id]){
        xp[receivedMessage.guild.id] = {}
    }
    if(!xp[receivedMessage.guild.id][receivedMessage.author.id]) {
        xp[receivedMessage.guild.id][receivedMessage.author.id] = {
            xp: 0,
            level: 1
        };
    }

    let xpAdd;

    if(receivedMessage.content.startsWith(prefix)) {
        xpAdd = Math.floor(Math.random() * 15) + 10
    }
    else {
        xpAdd = Math.floor(Math.random() * 7) + 8
    }

    xp[receivedMessage.guild.id][receivedMessage.author.id].xp = xp[receivedMessage.guild.id][receivedMessage.author.id].xp +  xpAdd;

    let nxtlevel = xp[receivedMessage.guild.id][receivedMessage.author.id].level * 300;


    if(xp[receivedMessage.guild.id][receivedMessage.author.id].xp >= nxtlevel) {
        xp[receivedMessage.guild.id][receivedMessage.author.id].xp = xp[receivedMessage.guild.id][receivedMessage.author.id].xp - nxtlevel;
        xp[receivedMessage.guild.id][receivedMessage.author.id].level = xp[receivedMessage.guild.id][receivedMessage.author.id].level + 1
        let leveleupEmbed = new Discord.RichEmbed()
        .setTitle("Level UP!")
        .setColor("a500ff")
        .addField(`Congratulations ${receivedMessage.author.tag}! You are now level ${xp[receivedMessage.guild.id][receivedMessage.author.id].level}!`,
         `Thanks for so many contributions`)

        receivedMessage.channel.send(leveleupEmbed)
    }
    fs.writeFile("./xp.json", JSON.stringify(xp), err => {
        if(err) console.log(err)
    })
}
client.login(token);