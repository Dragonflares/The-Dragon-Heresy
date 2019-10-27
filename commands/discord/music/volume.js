const {
    prefix,
    token,
    youtubeToken
}= require("../../../auth.json")
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const youtube = new YouTube(youtubeToken)

module.exports = {
    name: "volume",
    category: "discord",
    subcategory: "music",
    description: "Allows to modify the volume.",
    usage: "<id | mention>",
    run: async (client, message, args5, queue) => {
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        const serverQu = queue.get(message.guild.id);

        const args = message.content.split(' ');
        if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!')
        if (!serverQu) return message.channel.send('There is nothing playing.')
        if (!args[1]) return message.channel.send(`The current volume is: **${serverQu.volume}**`)
        serverQu.volume = args[1];
        serverQu.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
        return message.channel.send(`I set the volume to: **${args[1]}**`)
    }
}