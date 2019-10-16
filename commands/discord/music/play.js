const Util = require("discord.js")
const {
    prefix,
    token,
    youtubeToken
}= require("../../../auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)

module.exports = {
    name: "play",
    category: "discord",
    subcategory: "music",
    description: "Adds a song/s to the queue.",
    usage: "<id | mention>",
    run: async (client, message, args5, queue) => {
        const serverQueue = queue.get(message.guild.id);

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
                await handleVideo(video2, message, voiceChannel, true, queue, client); // eslint-disable-line no-await-in-loop
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
            return handleVideo(video, message, voiceChannel, false, queue, client);
        }
    }
}

async function handleVideo(video, receivedMessage, voiceChannel, playlist = false, queue, client) {
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
			play(receivedMessage.guild, queueConstruct.songs[0], queue, client)
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

function play(guild, song, queue, client) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
        queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0], queue, client);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}

function leave(serverQueue){
    serverQueue.voiceChannel.leave()
}