const { stripIndents } = require("common-tags");


module.exports = {
    name: "murder",
    category: "moderation",
    description: "Murders(kicks) the member out of the server. Tag self to commit ritual sepukku.",
    usage: "<id | mention>",
    run: async (client, receivedMessage, args, queue) => {
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
                        member.kick({reason: `${member} has commited sepukku and restored their honor.`}).then(() => {
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
}
