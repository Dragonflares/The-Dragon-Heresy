const Discord = require('discord.js')
const Util = require('discord.js')
const client = new Discord.Client()
const {
    prefix,
    token,
    youtubeToken
}= require("./auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(youtubeToken);

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
    const serverQueue = queue.get(receivedMessage.guild.id);

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
            playCommand(receivedMessage)
            break;
        }
        case "skip": {
            skipCommand(receivedMessage, serverQueue)
            break;
        }
        case "np": {
            nowPlayingRequest(receivedMessage, serverQueue)
            break;
        }
        case "stop": {
            stopCommand(receivedMessage, serverQueue)
            break;
        }
        case "handleEarrape": {
            earrapeCommand(receivedMessage,serverQueue)
            break;
        }
        default:{
            receivedMessage.channel.send("Invalid command.")
            break;
        }
    }
}

function helpCommand(arguments, receivedMessage){
    if(arguments.length == 0){
        receivedMessage.channel.send("Let me show you all I can do: ")
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
                if(messageAuthor.user == member.user){
                    member.kick({reason: `You've successfully commited sepukku, your honor has been restored in death`}).then(() => {
                        receivedMessage.channel.send(`I've successfully kicked ${user}`)
                      }).catch(err => {
                        receivedMessage.channel.send(`I was unable to kick ${member}`)
                        console.error(err)
                    })
                }
                else if(messageAuthor.highestRole.comparePositionTo(member.highestRole) < 1){
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

async function playCommand(message) {
	const args = message.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
        return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
    }
    if (!permissions.has('SPEAK')) {
        return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        const playlist = await youtube.getPlaylist(url);
        const videos = await playlist.getVideos();
        for (const video of Object.values(videos)) {
            const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
            await handleVideo(video2, message, voiceChannel, true); // eslint-disable-line no-await-in-loop
        }
        return message.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
    } else {
        try {
            var video = await youtube.getVideo(url);
        } catch (error) {
            try {
                var videos = await youtube.searchVideos(searchString, 10);
                let index = 0;
                message.channel.send(`
__**Song selection:**__
\`\`\`${videos.map(video2 => `${++index} - ${video2.title}`).join('\n')}\`\`\`
Please provide a value to select one of the search results ranging from 1-10.
                `);
                // eslint-disable-next-line max-depth
                try {
                    var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                        maxMatches: 1,
                        time: 10000,
                        errors: ['time']
                    });
                } catch (err) {
                    console.error(err);
                    return message.channel.send('No or invalid value entered, cancelling video selection.');
                }
                const videoIndex = parseInt(response.first().content);
                var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            } catch (err) {
                console.error(err);
                return message.channel.send('🆘 I could not obtain any search results.');
            }
        }
        return handleVideo(video, message, voiceChannel);
    }
}

function skipCommand(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
    if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');
    serverQueue.connection.dispatcher.end('Skip command has been used!');
    return undefined;
}

function stopCommand(message, serverQueue) {
    if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.')
    serverQueue.songs = []
    serverQueue.connection.dispatcher.end('Stop command has been used!')
    return undefined;
}

async function handleVideo(video, receivedMessage, voiceChannel, playlist = false) {
	const serverQueue = queue.get(receivedMessage.guild.id)
	console.log(video)
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	}
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: receivedMessage.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		}
		queue.set(receivedMessage.guild.id, queueConstruct)

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join()
			queueConstruct.connection = connection;
			play(receivedMessage.guild, queueConstruct.songs[0])
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`)
			queue.delete(receivedMessage.guild.id);
			return receivedMessage.channel.send(`I could not join the voice channel: ${error}`)
		}
	} else {
		serverQueue.songs.push(song)
		console.log(serverQueue.songs)
		if (playlist) return undefined
		else return receivedMessage.channel.send(`✅ **${song.title}** has been added to the queue!`)
	}
	return undefined
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}

function earrapeCommand(message, serverQu){
    const args = message.content.split(' ');
    if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!')
    if (!serverQu) return message.channel.send('There is nothing playing.')
    if (!args[1]) return message.channel.send(`The current volume is: **${serverQu.volume}**`)
    serverQu.volume = args[1];
    serverQu.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
    return message.channel.send(`I set the volume to: **${args[1]}**`)
}

function nowPlayingRequest(message, serverQueue) {
    if (!serverQueue) return message.channel.send('There is nothing playing.');
    return message.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
}

client.login(token)