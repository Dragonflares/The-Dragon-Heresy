

module.exports = {
    name: "np",
    category: "music",
    description: "Shows the current track.",
    usage: "<id | mention>",
    run: async (client, receivedMessage, args, queue) => {
        const serverQueue = queue.get(receivedMessage.guild.id);

        if (!serverQueue) return receivedMessage.channel.send('There is nothing playing.');
        return receivedMessage.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
    }
}
