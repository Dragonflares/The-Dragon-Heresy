const { Client, Collection } = require('discord.js')
const Discord = require('discord.js')
const client = new Client()
const {
    owner,
    prefix,
    token,
    youtubeToken,
    mongodblog
}= require("./auth.json")
const fs = require('fs')
const Enmap = require('enmap')
const SQLite = require("better-sqlite3");
const sql = new SQLite('./Database/experience.sqlite')
const techsql = new SQLite("./Database/Hades' Star/techs.sqlite")
const mongoose = require('mongoose')
const GuildModel = require('./Models/Guild')
const BattlegroupModel = require('./Models/Battlegroup')
const BattleshipModel = require('./Models/Battleship')
const MemberModel = require('./Models/Member')
const MinerModel = require('./Models/Miner')
const TechModel = require('./Models/Techs')
const TransportModel = require('./Models/Transport')

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false);
mongoose.connect(mongodblog, { useNewUrlParser: true, useUnifiedTopology: true })

client.creator = owner

const mongodb = mongoose.connection;
mongodb.on("error", () => {
    console.log("> error occurred from the database");
});
mongodb.once("open", () => {
    console.log("> successfully opened the database");
});

client.db = mongodb;
client.db.createCollection("Corp")
client.db.createCollection("Member")
client.db.createCollection("Tech")
client.db.createCollection("Battleship")
client.db.createCollection("Battlegroup")
client.db.createCollection("Miner")
client.db.createCollection("Transport")

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
    channel.send(`Welcome ${member}! May the Light of the Khala guide you.`)
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

client.on("guildMemberUpdate", (oldMember, newMember) => {
    if(!newMember.nickname)
        console.log("New member name " + newMember.user.username)
    else
        console.log("New member name " + newMember.nickname)
    updateRun(newMember)
})

async function updateRun(newMember){
    let member = await MemberModel.findOne({discordId: newMember.id.toString()})
    if(!member) return
    MemberModel.findOne({discordId: newMember.id.toString()}).populate("Corp").exec((err, CorpMember) => {
        if(err) console.log(err)
        if(!CorpMember){}
        if(CorpMember.Corp.corpId != newMember.guild.id.toString()) {}
        else {
            if(!newMember.nickname) {
                CorpMember.name = newMember.user.username
                CorpMember.save()
            }
            else {
                CorpMember.name = newMember.nickname
                CorpMember.save()
            }
        }
    })
}

client.on("presenceUpdate", (oldPresence, newPresence) => {
    var member = newPresence
    if(newPresence.presence.status != oldPresence.presence.status){
        if(newPresence.presence.status == "offline") {
            var lastSeenDate = new Date() 
            setLastSeenMember(lastSeenDate, member)
        }
    }
    else {
        return
    }
})

async function setLastSeenMember(lastSeenDate, newMember) {
    let member = await MemberModel.findOne({discordId: newMember.id.toString()})
    if(!member) return
    MemberModel.findOne({discordId: newMember.id.toString()}).populate("Corp").exec((err, CorpMember) => {
        if(err) console.log(err)
        if(!CorpMember){}
        if(CorpMember.Corp.corpId != newMember.guild.id.toString()) {}
        else {
            CorpMember.lastSeen = lastSeenDate
            CorpMember.save()
        }
    })
}

client.on("guildMemberRemove", async member => {
    console.log(member.user.username + " has left the server")
    let member2 = await MemberModel.findOne({discordId: member.id.toString()})
    if(!member2) return
    MemberModel.findOne({discordId: member.id.toString()}).populate("Corp").exec((err, CorpMember) => {
        if(err) console.log(err)
        if(!CorpMember){}
        if(CorpMember.Corp.corpId != member.guild.id.toString()) {}
        else {
            LeaveCorporation("Member", CorpMember)
        }
    })
})

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
        if(xp.level%5 === 0) {
            let leveleupEmbed = new Discord.RichEmbed()
            .setTitle("Level UP!")
            .setColor("a500ff")
            .addField(`Congratulations ${message.author.tag}! You are now level ${xp.level}!`,
                `Thanks for so many contributions`)
    
            message.channel.send(leveleupEmbed)
        }
    }
    client.setExp.run(xp);
}

async function LeaveBattlegroup(ObtainedCorp, MemberDataResult) {
    ObtainedCorp.battlegroups.forEach(battlegroup => {
        BattlegroupModel.findOne({_id: battlegroup}, (err, result) => {
            if(err) {
                return console.log(err)
            }
            else {
                let newMemberList = result.members.filter(member => member.toString() != MemberDataResult._id)
                if(MemberDataResult.battlegroupRank === "Captain") {
                    result.captain = newMemberList[1]
                    MemberModel.findOne({_id: result.captain}, (err, result) => {
                        if(err) return console.log(err)
                        else {
                            result.battlegroupRank = "Captain"
                            result.save()
                        }
                    }) 
                }
                if(newMemberList.length === result.members.length){}
                else {
                    result.members = newMemberList
                    result.save()
                }
            }
        })
    })
}

async function LeaveCorporation(newRank, MemberDataResult) {
    let OldCorporation
    GuildModel.findOne({corpId: MemberDataResult.Corp.corpId}, (err, ObtainedOne) => {
        if(err) return console.log(err)
        else {
            LeaveBattlegroup(ObtainedOne, MemberDataResult)   
            let remainingMembers = ObtainedOne.members.filter(member => member.toString() != MemberDataResult._id.toString())
            ObtainedOne.members = remainingMembers
            ObtainedOne.save()
        }
    })

    let NewCorporation
    await (GuildModel.findOne({corpId: "-1"}, (err, ObtainedOne) => {
        if(err) return console.log(err)
        if(!ObtainedOne) {
            Corporation = new GuildModel({
                _id: new Mongoose.Types.ObjectId(),
                name: "No Corporation worth mentioning",
                corpId: "-1"
            })
            Corporation.save()
            NewCorporation = Corporation
            setTimeout(assignNewCorp, 6000, newRank, NewCorporation, MemberDataResult)
        }
        else {
            NewCorporation = ObtainedOne
            setTimeout(assignNewCorp, 6000, newRank, NewCorporation, MemberDataResult)
        }
        
    }))
    
}

async function assignNewCorp(newRank, corp, MemberDataResult) {
    MemberDataResult.rank = newRank
    MemberDataResult.battlegroupRank = ""
    MemberDataResult.Corp = corp._id
    MemberDataResult.save().catch(err => console.log(err))
}

client.login(token);