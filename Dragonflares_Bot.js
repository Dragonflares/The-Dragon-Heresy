const { Client, Collection } = require('discord.js');
const Discord = require('discord.js')
const client = new Client()
const {
    prefix,
    token,
    youtubeToken
}= require("./auth.json")
const fs = require('fs')
const Enmap = require('enmap')
const SQLite = require("better-sqlite3");
const sql = new SQLite('./Database/experience.sqlite');


client.playersRole = new Enmap({
    name: 'playersRole',
    autoFetch: true,
    fetchAll: false,
    dataDir: "./Database/Hades' Star/",
    polling: true
})
client.playersPrimeDB = new Enmap({
    name: 'playersPrime',
    autoFetch: true,
    fetchAll: false,
    dataDir: "./Database/Hades' Star/",
    polling: true
})
client.battlegroups = new Enmap({
    name: 'battlegroups',
    autoFetch: true,
    fetchAll: false,
    dataDir: "./Database/Hades' Star/",
    polling: true
})
client.playersDB = new Enmap({
    name: 'players',
    autoFetch: true,
    fetchAll: false,
    dataDir: "./Database/Hades' Star/",
    polling: true
})
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");

(async function() {
    await client.playersDB.defer;
});
const queue = new Map();

// Run the command loader
["commands"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});


client.on('ready', () => {

    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xp';").get();
    if (!table['count(*)']) {
        sql.prepare("CREATE TABLE xp (id TEXT PRIMARY KEY, user TEXT, guild TEXT, experience INTEGER, level INTEGER);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_xp_id ON xp (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }
    client.getExp = sql.prepare("SELECT * FROM xp WHERE user = ? AND guild = ?");
    client.setExp = sql.prepare("INSERT OR REPLACE INTO xp (id, user, guild, experience, level) VALUES (@id, @user, @guild, @experience, @level);")
    
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
    
    if (cmd.length === 0) return message.channel.send("There's no command mentioned.");
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) {
        command.run(client, message, args, queue)
    }
    else {
        message.channel.send("That's no valid command!")
    }
});


async function triggerXp(message)
{
    let xp = client.getExp.get(message.author.id, message.guild.id);
    if (!xp) {
        xp = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, experience: 0, level: 1 }
    }

    let xpAdd;

    if(message.content.startsWith(prefix)) {
        xpAdd = Math.floor(Math.random() * 15) + 10
    }
    else {
        xpAdd = Math.floor(Math.random() * 7) + 8
    }

    xp.experience += xpAdd;
    const nxtlevel = 300 * xp.level
    if(xp.experience > nxtlevel) {
        xp.level++;
        xp.experience -= nxtlevel
        let leveleupEmbed = new Discord.RichEmbed()
        .setTitle("Level UP!")
        .setColor("a500ff")
        .addField(`Congratulations ${message.author.tag}! You are now level ${xp.level}!`,
            `Thanks for so many contributions`)

        message.channel.send(leveleupEmbed)
    }
    client.setExp.run(xp);
}
client.login(token);