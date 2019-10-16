const {
    prefix,
    token,
    youtubeToken
}= require("../../../auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)

module.exports = {
    name: "earrape",
    category: "discord",
    subcategory: "music",
    description: "ON/OFF command. EMBRACE THE EARRAPE.",
    usage: "<id | mention>",
    run: async (client, message, args4, queue) => {
        const serverQu = queue.get(message.guild.id);


        const args = message.content.split(' ');
        if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!')
        if (!serverQu) return message.channel.send('There is nothing playing.')
        if (!args[1]) return message.channel.send(`You didn't specify what you wanted.`)
        if (args[1].toLowerCase() == "on") {
            const volumeA = new String('100');
            serverQu.volume = volumeA;
            serverQu.connection.dispatcher.setVolumeLogarithmic(volumeA / 5)
            return message.channel.send(`**EMBRACE THE EARRAPE.**`)
        }
        else if (args[1].toLowerCase() == "off") {
            const volumeA = new String('5');
            serverQu.volume = volumeA
            serverQu.connection.dispatcher.setVolumeLogarithmic(volumeA / 5)
            return message.channel.send(`Peace has returned.`)
        }
        else {
            return message.channel.send(`The command is invalid.`)
        }
    }
}
