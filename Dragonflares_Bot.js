const Discord = require('discord.js')
const client = new Discord.Client()
const auth = require('auth.json')

client.on('ready', () => {
    console.log("I need a new job, yet I logged as " + client.user.tag)

    client.user.setActivity("Space Engineers")

    client.guilds.forEach((guild) => {
        console.log(guild.name)
        guild.channels.forEach((channel) => {
            console.log(' - ', channel.name, channel.id)
        })
    })
    // general de TBG 436263609711067151
    let generalChannel = client.channels.get("436263609711067151")
    //generalChannel.send("Buenas noches la concha de su madre")
})

client.on('message', (receivedMessage) => {
    if(receivedMessage.author == client.user) {
        return
    }
    //receivedMessage.channel.send("Y vos sos un pelotudo " 
    //   + receivedMessage.author)

    //receivedMessage.react("👍")

    if(receivedMessage.content.startsWith("#")){
        processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    if(primaryCommand == "help") {
        helpCommand(arguments, receivedMessage)
    } else if(primaryCommand == "murder"){
        murderCommand(arguments, receivedMessage)
    } else {
        receivedMessage.channel.send("Invalid command")
    }
}

function helpCommand(arguments, receivedMessage){
    if(arguments.length == 0){
        receivedMessage.channel.send("Let me show you all I can do")
    }
    else{
        receivedMessage.channel.send("So you need help with " + arguments)
    }
}

function murderCommand(arguments, receivedMessage){
    if(arguments.length == 0){
        receivedMessage.channel.send("Noone was chosen to murder")
    }
    else{
        receivedMessage.channel.send("I can't murder him yet")
    }
}

client.login(auth.token)