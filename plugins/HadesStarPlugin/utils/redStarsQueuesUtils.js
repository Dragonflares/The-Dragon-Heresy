import { MessageEmbed, MessageButton, CategoryChannel, MessageActionRow } from 'discord.js';
import { Corp, RedStarLog } from '../database'
import Mongoose from 'mongoose'

export const collectorFunc = async (client, messageReaction, newRedStarQueue, b) => {
    await b.deferUpdate().catch(console.error)
    //Delete old status message
    let deleted = false

    //Fetch players
    let registeredPlayers = newRedStarQueue.registeredPlayers
    let extraPlayers = newRedStarQueue.extraPlayers

    if (b.user.id == newRedStarQueue.author && (b.customId == "delete" || b.customId == "done")) {
        if (b.customId == "delete") {     //When Trash
            deleted = true
            return failed(client, messageReaction, newRedStarQueue, false);

        } else if (b.customId == "done") { //Done
            if (registeredPlayers.size > 1) {
                await updateEmbed(client, messageReaction, newRedStarQueue, true) //Update the Embeed to show the new reaction    

            } else {
                await b.followUp({ content: 'You need more than one player to finish a queue', ephemeral: true }).catch(console.error);
            }
        } else {
            await b.followUp({ content: 'You are not the owner of this invitation', ephemeral: true }).catch(console.error);
        }
        return;
    }
    else {

        // When other buttons
        // Check if already in the queue
        let hadCroidAndClickCroid = b.customId == "has_croid" && registeredPlayers.has(b.user.id) && registeredPlayers.get(b.user.id) == '✅'
        let noCroidAndClockNoCroid = b.customId == "no_croid" && registeredPlayers.has(b.user.id) && registeredPlayers.get(b.user.id) == '❎'

        //Get out of queue
        if (hadCroidAndClickCroid || noCroidAndClockNoCroid) {
            //Remove player
            registeredPlayers.delete(b.user.id)
            extraPlayers.delete(b.user.id)
        } else {
            //Get in queue
            if (b.customId == "has_croid" || b.customId == "no_croid") {
                if (b.customId == "has_croid")
                    registeredPlayers.set(b.user.id, '✅')
                else
                    registeredPlayers.set(b.user.id, '❎')

            }
        }
        //Unregister plus one/tro
        let plusOneClickPlusOne = b.customId == "plusOne" && extraPlayers.has(b.user.id) && extraPlayers.get(b.user.id) == 1
        let plusTwoClickPlusTwo = b.customId == "plusTwo" && extraPlayers.has(b.user.id) && extraPlayers.get(b.user.id) == 2

        if (plusOneClickPlusOne || plusTwoClickPlusTwo) {
            // Remove  the +1/2
            extraPlayers.delete(b.user.id)
        }
        else {
            // add plusone/two
            let currentPeopleAmm = newRedStarQueue.registeredPlayers.size
            newRedStarQueue.extraPlayers.forEach((value, key) => currentPeopleAmm += parseInt(value))

            if (registeredPlayers.has(b.user.id) && (b.customId == "plusOne" || b.customId == "plusTwo")) {
                // When plus one
                if (b.customId == "plusOne") {
                    if (currentPeopleAmm > 3) return await b.followUp({ content: 'Too many players', ephemeral: true }).catch(console.error);; // If more than 3, too many players (4)
                    extraPlayers.set(b.user.id, 1)
                } else if (b.customId == "plusTwo") {
                    if (currentPeopleAmm > 2) return await b.followUp({ content: 'Too many players', ephemeral: true }).catch(console.error);; //if more than 2 too many players (3)
                    extraPlayers.set(b.user.id, 2)
                }

            }
        }
        //Update db
        newRedStarQueue.registeredPlayers = registeredPlayers
        newRedStarQueue.extraPlayers = extraPlayers

        //Delete old message
        await deleteOldStatusMsgs(client, newRedStarQueue)

        // Update Message
        let sendData = await updateEmbed(client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   

        if (sendData) {
            // Make new message
            await sendStatusMsg(client, messageReaction, newRedStarQueue)
        }
    }

    // Save database changes
    if (!deleted) {
        await newRedStarQueue.save().catch(r => {})
    }
}

export const sendStatusMsg = async (client, message, newRedStarQueue) => {
    //Send jump botton message
    var link = "http://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
    let urlbutton = new MessageButton()
        .setStyle(5)
        .setURL(link)
        .setLabel('Jump to Recruit!');

    let btnRow = new MessageActionRow()
    btnRow.addComponents(urlbutton)

    //Needed to fill
    let maxMembers = 4
    if (newRedStarQueue.rsLevel < 3)
        maxMembers = 2

    let currentPeopleAmm = 0
    newRedStarQueue.registeredPlayers.forEach(async (croid, memberID) => {
        if (newRedStarQueue.extraPlayers.has(memberID)) {
            currentPeopleAmm += parseInt(newRedStarQueue.extraPlayers.get(memberID));
        }
        currentPeopleAmm++;
    })

    let statusMessage = await message.channel.send({ content: `There is currently a RS${newRedStarQueue.rsLevel} going with ${currentPeopleAmm}/${maxMembers}`, components: [btnRow] })
    if (statusMessage) {
        newRedStarQueue.currentStatusMessages.push(statusMessage.id.toString())
    }
}

export const deleteOldStatusMsgs = async (client, redStarQueue) => {
    for (let i = 0; i < redStarQueue.currentStatusMessages.length + 1; i++) {
        let statusMsg = redStarQueue.currentStatusMessages.pop()
        try {
            let currentStatusMessage = await client.channels.cache.get(redStarQueue.recruitChannel).messages.fetch(statusMsg)
            if (currentStatusMessage)
                await currentStatusMessage.delete({ timeout: 1 })
        } catch (r) { }
    }
}

export const updateEmbed = async (client, message, newRedStarQueue, close) => {
    try {
        // Members text and count members
        let membersString = ""
        let currentPeopleAmm = 0
        newRedStarQueue.registeredPlayers.forEach(async (croid, memberID) => {
            let tx = ""
            let memberUsername = client.users.cache.find(u => u.id == memberID).username
            if (newRedStarQueue.extraPlayers.has(memberID)) {
                tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
                currentPeopleAmm += parseInt(newRedStarQueue.extraPlayers.get(memberID));
            }
            membersString += ` <@${memberID}> ${croid} ${tx} (${memberUsername})\n`
            currentPeopleAmm++;
        })
        if (membersString == "") membersString = "None";

        //Get Embed
        let newEmbed = new MessageEmbed(message.embeds[0])

        //Needed to fill
        let maxMembers = 4
        if (newRedStarQueue.rsLevel < 3)
            maxMembers = 2


        //Update Embed
        newEmbed.fields[0].value = `${currentPeopleAmm}/${maxMembers}` //"Current People"
        newEmbed.fields[1].value = `${membersString}` //"Members"

        //Check if amount of members is enough to finish
        if (currentPeopleAmm == maxMembers || close) {
            // Save an RS Log
            let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();
            let newRSLog = new RedStarLog({
                _id: new Mongoose.Types.ObjectId(),
                corpOpened: corp,
                level: newRedStarQueue.rsLevel,
                timeClosed: new Date(),
                endStatus: "Succeeded",
                creatorId: newRedStarQueue.author,
                membersIds: Array.from(newRedStarQueue.registeredPlayers.keys())
            })
            corp.redStarLogs.push(newRSLog)
            await newRSLog.save()
            await corp.save()

            //Set color to green
            newEmbed.setColor("GREEN");
            newEmbed.setFooter({ text: "Invitation full" })

            //Create ping message
            let pingString = ""
            newRedStarQueue.registeredPlayers.forEach(async (croid, memberID) => {
                let tx = ""
                if (newRedStarQueue.extraPlayers.has(memberID)) tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
                pingString += ` <@${memberID}> ${croid} ${tx},`
            })

            if (!close) {
                pingString += ` Full Team for RS${newRedStarQueue.rsLevel}!`
            } else {
                pingString += ` Partial Team for RS${newRedStarQueue.rsLevel}!`
            }

            if (currentPeopleAmm == 2)
                pingString += ` Lets duo this!`
            else if (currentPeopleAmm == 3)
                pingString += ` Almost full!`

            if (message) {
                // Send ping
                message.channel.send(pingString);

                // Remove buttons
                message.edit({ components: [], embeds: [newEmbed] });
            }
            //Remove queue from db
            await newRedStarQueue.remove()
            return false
        } else {

            // Set color and send the embed
            newEmbed.setColor("ORANGE");
            if (message)
                message.edit({ embeds: [newEmbed] });

            return true

        }
    } catch (e) { console.log(e) }
}

export const failed = async (client, message, newRedStarQueue, timedout) => {

    await deleteOldStatusMsgs(client, newRedStarQueue)

    let newEmbed = new MessageEmbed(message.embeds[0])
    newEmbed.fields[0].value = `0/0`
    newEmbed.setColor("RED")
    if (!timedout)
        newEmbed.setFooter({ text: "Closed" })
    else
        newEmbed.setFooter({ text: "Timed Out" })
    if (message)
        message.edit({ components: [], embeds: [newEmbed] });

    //Create ping message
    let pingString = ""
    newRedStarQueue.registeredPlayers.forEach(async (croid, memberID) => {
        let tx = ""
        if (newRedStarQueue.extraPlayers.has(memberID)) tx = `**+${newRedStarQueue.extraPlayers.get(memberID)}**`
        pingString += ` <@${memberID}> ${croid} ${tx},`
    })

    if (!timedout) {
        pingString += ` Queue was closed with partial team for RS${newRedStarQueue.rsLevel}!`
    } else {
        pingString += ` Queue was timed out with partial team for RS${newRedStarQueue.rsLevel}!`
    }
    // Send ping
    await message.channel.send(pingString);

    await newRedStarQueue.remove();
}