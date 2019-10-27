

module.exports = {
    name: "np",
    category: "discord",
    subcategory: "music",
    description: "Shows the current track.",
    usage: "<id | mention>",
    run: async (client, receivedMessage, args, queue) => {
        if(message.mentions.users > 0) return message.channel.send("You can't tag members for this command.")
        const serverQueue = queue.get(receivedMessage.guild.id);

        if (!serverQueue) return receivedMessage.channel.send('There is nothing playing.');
        return receivedMessage.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
    }
}
