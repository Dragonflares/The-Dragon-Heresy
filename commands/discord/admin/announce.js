module.exports = {
    name: "announce",
    aliases: ["ann"],
    category: "discord",
    subcategory: "admin",
    description: "Mutes every other user, allowing for a 15 second announce, then unmutes everyone.",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        const actualVoiceChannel = message.member.voiceChannel
        if(!actualVoiceChannel){
             return message.channel.send(`You are not in a Voice Channel!`)
        }
        else {
            if(!message.member.hasPermission('MUTE_MEMBERS'))
            {
                return message.channel.send(`You don't have the permissions to mute other members!`)
            }
            else {
                if (!message.member.hasPermission('CONNECT')) {
                    return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!')
                }
                if (!message.member.hasPermission('MUTE_MEMBERS')) {
                    return message.channel.send(`I don't have the permissions to mute other members!`)
                }
                actualVoiceChannel.join().then(connection => {
                    for (let member of actualVoiceChannel.members) {
                        member[1].setMute(true)
                    }
                    message.member.setMute(false)
                    message.channel.send(`You have requested to make an announcement, you may speak now.`)
                    client.setTimeout(function(){
                        for (let member of actualVoiceChannel.members) {
                            member[1].setMute(true)
                        }
                        actualVoiceChannel.leave()
                        return message.channel.send(`The announcement has finished, everyone may speak now.`)
                    }, 15000)

                }).catch(err => console.log(err.message))
            }
        }
    }
}



    
