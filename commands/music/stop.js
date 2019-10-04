const {
    prefix,
    token,
    youtubeToken
}= require("../../auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)

module.exports = {
    name: "stop",
    category: "music",
    description: "Stops the current music queue and disconnects the bot.",
    usage: "<id | mention>",
    run: async (client, message, args, queue) => {
        const serverQueue = queue.get(message.guild.id);

        if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.')
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end('Stop command has been used!')
        return message.channel.send('Goodbye.');
    }
}