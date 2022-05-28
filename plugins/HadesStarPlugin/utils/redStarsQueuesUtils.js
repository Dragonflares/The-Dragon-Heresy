const Discord = require('discord.js');
const { MessageButton, MessageActionRow } = require("discord-buttons")
import { RedStarRoles, RedStarQueue, Corp, RedStarLog} from '../database'
import Mongoose from 'mongoose'

export const collectorFunc = async(client, messageReaction, newRedStarQueue, b) => {

    //Delete old status message
    // Fetch status message
    let currentStatusMessage = null
    try{ // Check if message is gone
        currentStatusMessage = await client.channels.cache.get(newRedStarQueue.recruitChannel).messages.fetch(newRedStarQueue.currentStatusMessage.toString());
    }catch(r){}
    if (currentStatusMessage) currentStatusMessage.delete({ timeout: 1 });

    //Fetch players
    let registeredPlayers = newRedStarQueue.registeredPlayers
    let extraPlayers = newRedStarQueue.extraPlayers


    if (b.id == "delete") {     //When Trash
        if (b.clicker.user.id == newRedStarQueue.author) {
            this.failed(client, messageReaction, newRedStarQueue, false);
            return await b.reply.send('Invitation Deleted', true);
        }
        return await b.reply.send('You are not the owner of this invitation', true);
    } else if (b.id== "done") { //Done
        if( b.clicker.user.id == newRedStarQueue.author ) {
            if ( registeredPlayers.size > 1 ){
                currentStatusMessage = await this.updateEmbed(client, messageReaction, newRedStarQueue, true) //Update the Embeed to show the new reaction    
                return await b.reply.defer()
            }else{
                return await b.reply.send('You need more than one player to finish a queue', true);
            }
        }
        return await b.reply.send('You are not the owner of this invitation', true);
    }
    
    // When other buttons
    // Check if already in the queue
    let hadCroidAndClickCroid = b.id == "has_croid" && registeredPlayers.has(b.clicker.user.id) && registeredPlayers.get(b.clicker.user.id) == '✅'
    let noCroidAndClockNoCroid = b.id == "no_croid" && registeredPlayers.has(b.clicker.user.id) && registeredPlayers.get(b.clicker.user.id) == '❎'

    //Get out of queue
    if (hadCroidAndClickCroid || noCroidAndClockNoCroid) {

        //Remove player
        registeredPlayers.delete(b.clicker.user.id)
        extraPlayers.delete(b.clicker.user.id)

        //Update db
        newRedStarQueue.registeredPlayers =registeredPlayers
        newRedStarQueue.extraPlayers = extraPlayers

        //Update Message
        currentStatusMessage = await this.updateEmbed(client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   

        // Save database changes
        newRedStarQueue.currentStatusMessage=currentStatusMessage.id;
        await newRedStarQueue.save()

    return await b.reply.send('You out of the queue', true);
    }

    //Get in queue
    if (b.id == "has_croid" || b.id == "no_croid") {
        if (b.id == "has_croid")
            registeredPlayers.set(b.clicker.user.id, '✅')
        else
            registeredPlayers.set(b.clicker.user.id, '❎')

        //Update db
        newRedStarQueue.registeredPlayers =registeredPlayers

        //Update Message
        currentStatusMessage = await this.updateEmbed(client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   
        
        // Save database changes
        newRedStarQueue.currentStatusMessage=currentStatusMessage.id;
        await newRedStarQueue.save()
        
        return await b.reply.defer()
    }

    //Unregister plus one/tro
    let plusOneClickPlusOne = b.id == "plusOne" && extraPlayers.has(b.clicker.user.id) && extraPlayers.get(b.clicker.user.id) == 1
    let plusTwoClickPlusTwo = b.id == "plusTwo" && extraPlayers.has(b.clicker.user.id) && extraPlayers.get(b.clicker.user.id) == 2

    if (plusOneClickPlusOne || plusTwoClickPlusTwo) {

        // Remove  the +1/2
        extraPlayers.delete(b.clicker.user.id)

        //Update db
        newRedStarQueue.extraPlayers = extraPlayers

        // Update Message
        currentStatusMessage = await this.updateEmbed(client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   

        // Save database changes
        newRedStarQueue.currentStatusMessage=currentStatusMessage.id;
        await newRedStarQueue.save()

        return await b.reply.send('Unregistered plus player/s', true);
    }

    // add plusone/two
    let currentPeopleAmm = newRedStarQueue.registeredPlayers.size
    newRedStarQueue.extraPlayers.forEach((value, key) => currentPeopleAmm += parseInt(value))

    if (registeredPlayers.has(b.clicker.user.id)) {

        // When plus one
        if (b.id == "plusOne") {
            if (currentPeopleAmm > 3) return await b.reply.send('Too many players', true); // If more than 3, too many players (4)
            extraPlayers.set(b.clicker.user.id, 1)
        } else if (b.id == "plusTwo") {
            if (currentPeopleAmm > 2) return await b.reply.send('Too many players', true); //if more than 2 too many players (3)
            extraPlayers.set(b.clicker.user.id, 2)
        }

        //Update db
        newRedStarQueue.extraPlayers = extraPlayers

        // Update Message
        currentStatusMessage = await this.updateEmbed(client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   
        
        // Save database changes
        if(currentStatusMessage){
            newRedStarQueue.currentStatusMessage= currentStatusMessage.id;
            await newRedStarQueue.save()
        }

        return await b.reply.defer()
    }
}


export const  updateEmbed = async (client, message, newRedStarQueue, close) => { 
    // Members text and count members
    let membersString = ""
    let currentPeopleAmm=0
    newRedStarQueue.registeredPlayers.forEach( async (croid, memberID) => {
        let tx = ""
        let memberUsername = client.users.cache.find(u=> u.id == memberID).username
        if (newRedStarQueue.extraPlayers.has(memberID)) {
            tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
            currentPeopleAmm += parseInt(newRedStarQueue.extraPlayers.get(memberID));
        }
        membersString += ` <@${memberID}> ${croid} ${tx} (${memberUsername})\n`
        currentPeopleAmm++;
    })
    if (membersString == "") membersString = "None";

    //Get Embed
    let newEmbed = new Discord.MessageEmbed(message.embeds[0])

    //Update Embed
    newEmbed.fields[0].value = `${currentPeopleAmm}/4` //"Current People"
    newEmbed.fields[1].value = `${membersString}` //"Members"
    
    //Check if amount of members is enough to finish
    if (currentPeopleAmm == 4 || close) { 
        // Save an RS Log
        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();
        let newRSLog = new RedStarLog({
            _id: new Mongoose.Types.ObjectId(),
            corpOpened: corp,
            level: newRedStarQueue.rsLevel,
            timeClosed: new Date(),
            endStatus: "Succeeded",
            creatorId: newRedStarQueue.author,
            membersIds: Array.from(newRedStarQueue.registeredPlayers.keys()).map(a => a.id)
        })
        corp.redStarLogs.push(newRSLog)
        await newRSLog.save()
        await corp.save()

        //Set color to green
        newEmbed.setColor("GREEN");

        //Create ping message
        let pingString = ""
        newRedStarQueue.registeredPlayers.forEach( async (croid, memberID) => {
          let tx = ""
          if (newRedStarQueue.extraPlayers.has(memberID)) tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
          pingString += ` <@${memberID}> ${croid} ${tx},`
        })

        if(!close) {
            pingString += ` Full Team for RS${newRedStarQueue.rsLevel}!`
        }else{
            pingString += ` Partial Team for RS${newRedStarQueue.rsLevel}!`
        }

        if(currentPeopleAmm == 2)
            pingString += ` Lets duo this!`
        else if(currentPeopleAmm == 3)
            pingString += ` Almost full!`

        // Send ping
        message.channel.send(pingString);
        
        // Remove buttons
        message.edit({ component: null, embed: newEmbed });

        //Remove queue from db
        await newRedStarQueue.remove()
    }else{

        // Set color and send the embed
        newEmbed.setColor("ORANGE");
        message.edit("",newEmbed); 

        //Send jump botton message
        var link = "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
        let urlbutton = new MessageButton()
          .setStyle('url')
          .setURL(link)
          .setLabel('Jump to Recruit!');
        let sent = await message.channel.send(`There is currently a RS${newRedStarQueue.rsLevel} going with ${currentPeopleAmm}/4`, urlbutton)
        return sent;
        
    }
}

export const failed = async (client, message, newRedStarQueue,timedout) => { 
    let newEmbed = new Discord.MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `0/0` 
    newEmbed.setColor("RED")
    if(!timedout)
        newEmbed.setFooter("Closed")
    else
        newEmbed.setFooter("Timed Out")
    message.edit({ component: null, embed: newEmbed });

    //Create ping message
    let pingString = ""
    newRedStarQueue.registeredPlayers.forEach( async (croid, memberID) => {
    let tx = ""
    if (newRedStarQueue.extraPlayers.has(memberID)) tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
    pingString += ` <@${memberID}> ${croid} ${tx},`
    })

    if(!timedout) {
        pingString += ` Queue was closed with partial team for RS${newRedStarQueue.rsLevel}!`
    }else{
        pingString += ` Queue was timeout with partial team for RS${newRedStarQueue.rsLevel}!`
    }
    // Send ping
    message.channel.send(pingString);

    await newRedStarQueue.remove();
}