const Discord = require('discord.js')
const client = new Discord.Client()
const {
    prefix,
    token,
    youtubeToken
}= require("./auth.json")
const ytdl = require('ytdl-core')
const path = require('path');
const queue = new Map();


client.on('ready', () => {
    console.log("I need a new job, yet I logged in as " + client.user.tag)

    client.user.setActivity("Space Engineers")

    client.guilds.forEach((guild) => {
        console.log(guild.name, guild.id)
        //guild.systemChannel.send(`Guilty as charged to exist, ${guild.owner}`)
        //guild.channels.forEach((channel) => {
        //    console.log(' - ', channel.name, channel.id)
        //})
    })

    // member.roles.find('name', 'Admin')
    // general de TBG 436263609711067151
    let generalChannel = client.channels.get("436263609711067151")
    //generalChannel.send("Buenas noches la concha de su madre, y hola ")
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(ch => ch.name === 'member-log')
    if (!channel) {
        return
    }
    if(guild.id == '436263609711067147') {
        channel.send(`Bienvenido a Team La Buena Gente, no se quién carajo te invitó, ${member}, pero bienvenido. \n
        Datazo innecesario, el ${guild.owner} me creó, así que agradecele`)
    }
    else {
        channel.send(`Welcome ${member}! Feel free to read the RuleSet in the Rules channel and feel free to join any of our common chat channels, we are very happy to have you around. Come and say hi!`)
    }

  })
 


client.on('message', (receivedMessage) => {
    if(receivedMessage.author == client.user) {
        return
    }
    //receivedMessage.channel.send("Y vos sos un pelotudo " 
    //   + receivedMessage.author)

    //receivedMessage.react("👍")

    if(receivedMessage.content.startsWith(prefix)){
        processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    const serverQueue = queue.get(receivedMessage.guild.id)


    switch(primaryCommand){
        case "help":{
            helpCommand(arguments, receivedMessage)
            break;
        }
        case "murder":{
            murderCommand(receivedMessage)
            break;
        }
        case "obliterate": {
            obliterateCommand(receivedMessage)
            break;
        }
        case "play": {
            playCommand(receivedMessage, serverQueue)
            break;
        }
        case "skip": {
            skipCommand(receivedMessage, serverQueue)
            break;
        }
        case "stop": {
            stopCommand(receivedMessage, serverQueue)
            break;
        }
        default:{
            receivedMessage.channel.send("Invalid command")
            break;
        }
    }
}

function helpCommand(arguments, receivedMessage){
    if(arguments.length == 0){
        receivedMessage.channel.send("Let me show you all I can do: \n")
    }
    else{
        receivedMessage.channel.send("So you need help with " + arguments)
    }
}

function murderCommand(receivedMessage){
    receivedMessage.reply(`attempting to murder people is bad, buddy`)
    receivedMessage.channel.send(`Yet, about the task you gave me...`)
    if(arguments.length == 0){
        receivedMessage.channel.send("Noone was chosen to murder")
    }
    else{
        const user = receivedMessage.mentions.users.first()
        const messageAuthor = receivedMessage.guild.member(receivedMessage.author);
        if(user){
            const member = receivedMessage.guild.member(user)
            if(member){
                if(messageAuthor.highestRole.comparePositionTo(member.highestRole) < 1){
                    receivedMessage.channel.send(`You don't have the permissions to kick ${member}`)
                }
                else {
                    member.kick(`I'm really sorry but you've been kicked`).then(() => {
                        receivedMessage.channel.send(`I've successfully kicked ${user}`)
                      }).catch(err => {
                        receivedMessage.channel.send(`I was unable to kick ${member}`)
                        console.error(err)
                      })
                }
            }
            else{
                receivedMessage.channel.send("The person you wanted to murder doesn't belong to this server")
            }
        }
        else{
            receivedMessage.channel.send("The target you selected isn't an aviable target.")
        }
    }
}

function obliterateCommand(receivedMessage){
    receivedMessage.reply(`well, if you really want to obliterate him, he must deserve it.`)
    receivedMessage.channel.send(`So, about the task you gave me...`)
    if(arguments.length == 0){
        receivedMessage.channel.send("Noone was chosen to be obliterated")
    }
    else{
        const user = receivedMessage.mentions.users.first()
        const messageAuthor = receivedMessage.guild.member(receivedMessage.author);
        if(user){
            const member = receivedMessage.guild.member(user)
            if(member){
                if(messageAuthor.highestRole.comparePositionTo(member.highestRole) < 1){
                    receivedMessage.channel.send(`You don't have the permissions to ban ${member}`)
                }
                else {
                    member.ban({
                            reason: `I'm really sorry but you've been obliterated(banned) form this server`
                        }).then(() => {
                        receivedMessage.channel.send(`I've successfully banned ${user}`)
                      }).catch(err => {
                        receivedMessage.channel.send(`I was unable to banned ${member}`)
                        console.error(err)
                      })
                }
            }
            else {
                receivedMessage.channel.send("The person you wanted to obliterate doesn't belong to this server")
            }
        }
        else{
            receivedMessage.channel.send("The target you selected isn't an aviable target.")
        }
    }
}



async function playCommand(message, serverQueue) {
    const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

function skipCommand(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stopCommand(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token)