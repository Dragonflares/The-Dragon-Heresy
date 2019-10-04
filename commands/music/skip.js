const {
    prefix,
    token,
    youtubeToken
}= require("../../auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)

module.exports = {
    name: "skip",
    category: "music",
    description: "Skips the current track.",
    usage: "<id | mention>",
    run: async (client, message, args, queue) => {
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
        if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');
        serverQueue.connection.dispatcher.end('Skip command has been used!');
        return undefined;
    }
}