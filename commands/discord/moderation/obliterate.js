module.exports = {
    name: "obliterate",
    category: "discord",
    subcategory:  "moderation",
    description: "Obliterates(bans) the member form the server.",
    usage: "<id | mention>",
    run: async (client, receivedMessage, args, queue) => {
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
                            receivedMessage.channel.send(`I was unable to ban ${member}`)
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
}