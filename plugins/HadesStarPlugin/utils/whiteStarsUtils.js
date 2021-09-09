const Discord = require('discord.js');
import { Member, WhiteStar } from '../database';

export let NormalShow = true

export const whiteStarRecruitReactions = ['🤚', '🆘', '🚮', '✅']

export const whiteStarStatusReactions = new Map([
    ["Recruiting", ['🚮']],
    ["WaitForScan", ['🚮', '🆘', '⬅️', '✅', '🔄']],
    ["Scanning", ['🚮', '🆘', '🛑', '✅', '🔄']],
    ["Running", ['🚮', '🆘', '⬅️', '🔄', '🕙', '🕚', '🕐', '🕑']]
])

export const whiteStarPrefEmojiGroup = new Map([
    ['⚔️', "Attackers"],
    ['🛡️', "Defenders"],
    ['🗡️', "Assassins"],
    ['❓', "Doesnt Matter"]
])

export const embedTitles = new Map([
    ["Recruiting", "Waiting for recruitment"],
    ["WaitForScan", "Waiting for scanning"],
    ["Scanning", "Scanning"],
    ["Running", "Running"]
])

export const embedColors = new Map([
    ["Recruiting", "RED"],
    ["WaitForScan", "ORANGE"],
    ["Scanning", "ORANGE"],
    ["Running", "GREEN"]
])

export const embedFooters = new Map([
    ["Recruiting", `🚮 - Delete White Star`],
    ["WaitForScan", `🚮 - Delete White Star 🆘 - Switch to text mode ⬅️ - Back to recruit ✅ - Start Scan  🔄 - Refresh`],
    ["Scanning", `🚮 - Delete White Star 🆘 - Switch to text mode 🛑 - Stop Scan ✅ - Found Match! 🔄 - Refresh`],
    ["Running", `🚮 - Delete White Star 🆘 - Switch to text mode ⬅️ - Back to scan 🔄 - Refresh\n 🕙: -10 Min 🕚: -1 Min 🕐: +1 Min 🕑: +10 Min`]
])

export const whiteStarRecruitMessage = async (ws) => {
    //Get Members
    let prefCatStrings = new Map()

    //Fill Categries with None
    whiteStarPrefEmojiGroup.forEach((value) => prefCatStrings.set(value, "None"))

    if (ws.members) {
        Array.from(ws.members).map(async t => {
            //Get Player Category
            let cat = whiteStarPrefEmojiGroup.get(ws.preferences.get(t.discordId));

            //If Player Leads
            let command = ws.leadPreferences.has(t.discordId) ? ' 🤚' : ''

            //Add him to the string
            if (this.NormalShow) {
                if (prefCatStrings.get(cat) == "None")
                    prefCatStrings.set(cat, `<@${t.discordId}>${command}`)
                else
                    prefCatStrings.set(cat, `${prefCatStrings.get(cat)}\n<@${t.discordId}>${command}`)
            } else {
                if (prefCatStrings.get(cat) == "None")
                    prefCatStrings.set(cat, `${t.name}${command}`)
                else
                    prefCatStrings.set(cat, `${prefCatStrings.get(cat)}\n${t.name}${command}`)
            }
        })
    }

    //Create Message
    let rolesEmbed = new Discord.MessageEmbed()
        .setTitle(`White Star Recruitment by ${ws.author.name}:`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .setDescription(`${ws.description}`)
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Current People", ws.members ? Object.keys(ws.members).length : "0")

    //Add Categories and players
    whiteStarPrefEmojiGroup.forEach((value, key) =>
        rolesEmbed.addField(`${key} ${value}`, prefCatStrings.get(value), true))

    //Footers
    if (ws.status == "Recruiting") {
        rolesEmbed.setColor("ORANGE")
            .setFooter(`🤚 - Commander  🆘 - Switch to text mode 🚮 - Stop Recruit ✅ - Finish Recruit`)
    }
    else {
        rolesEmbed.setColor("GREEN")
            .setFooter(`Recruitment Done`)
    }
    return rolesEmbed;

}

export const whiteStarStatusMessage = async (message, ws) => {
    //Create Message
    let statusEmbed = new Discord.MessageEmbed()

    //Set Common Items
    statusEmbed.setTitle(`White Star Status`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Status:", embedTitles.get(ws.status))
    if (ws.status == "Scanning") {
        //calculate delta time
        let today = new Date()
        let diffMs = today - ws.scantime
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        diffMins = diffMins.toString().padStart(2, '0')
        statusEmbed.addField("Time Passed:", `${diffDays} Days,  ${diffHrs} Hours and ${diffMins} Minutes`)
    } else if (ws.status == "Running") {
        //calculate delta time
        let today = new Date()
        let diffMs = 432000000 - (today - ws.matchtime)
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        statusEmbed.addField("Current Time:", `${diffDays} Days,  ${diffHrs} Hours and ${diffMins} Minutes`)
    }
    if (ws.status != "Recruiting") {
        //Create variables
        let assignedBs = new Array();
        let assignedSp = new Array();
        let bsGroupMembers = new Map()
        let spGroupMembers = new Map()
        let afkMembers = new Map()

        //Check AFKs
        await Promise.all(Array.from(ws.members).map(async player => {
            let member = await Member.findOne({ discordId: player.discordId.toString() }).populate('Corp').populate('techs').exec();
            if (!member) afkMembers.set(chMember, "")
            if (member.awayTime) {
                let awayTime = new Date();
                if (awayTime.getTime() < member.awayTime.getTime()) {
                    afkMembers.set(player.discordId, "🅰️")
                } else {
                    afkMembers.set(player.discordId, "")
                }
            } else {
                afkMembers.set(player.discordId, "")
            }
        }))

        //Fill groups
        await Promise.all(ws.bsGroupsRoles.map(async role => {
            await Promise.all(Array.from(ws.members).map(async player => {
                let roleMember = await message.guild.members.fetch(player.discordId)
                if (roleMember.roles.cache.find(r => r.id == role)) {
                    assignedBs.push(player)
                    if (bsGroupMembers.has(role))
                        bsGroupMembers.get(role).push(roleMember)
                    else
                        bsGroupMembers.set(role, new Array(roleMember))
                }
            }))
        }))

        await Promise.all(ws.spGroupsRoles.map(async role => {
            await Promise.all(Array.from(ws.members).map(async player => {
                let roleMember = await message.guild.members.fetch(player.discordId)
                if (roleMember.roles.cache.find(r => r.id == role)) {
                    assignedSp.push(player)
                    if (spGroupMembers.has(role))
                        spGroupMembers.get(role).push(roleMember)
                    else
                        spGroupMembers.set(role, new Array(roleMember))
                }
            }))
        }))
        let unassignedBsString
        let bsString
        let unassignedSpString
        let spString
        let playersString
        if (this.NormalShow) {
            //Generate Battleships string
            unassignedBsString = Array.from(ws.members)
                .filter(t => !assignedBs.includes(t))
                .map(t => `-<@${t.discordId}> ${ws.preferences.get(t.discordId)}${ws.leadPreferences.has(t.discordId) ? ' 🤚' : ''}${ws.playerBsNotes.has(t.discordId) ? ` ${ws.playerBsNotes.get(t.discordId)}` : ''}`)
                .join('\n')

            bsString = Array.from(bsGroupMembers)
                .map(([groupName, players]) => `**<@&${groupName}> ${ws.groupNotes.has(groupName) ? ` ${ws.groupNotes.get(groupName)}` : ''}:**\n --${Array.from(players)
                    .map(p => `${p} ${ws.playerBsNotes.has(p.id) ? ` ${ws.playerBsNotes.get(p.id)}` : ''}`).join('\n--')}\n`)
                .join('\n')
            if (unassignedBsString != "") bsString = bsString + "\n**Unassigned:**\n" + unassignedBsString
            bsString == "" ? bsString = "None" : bsString

            //Generate Support string
            unassignedSpString = Array.from(ws.members)
                .filter(t => !assignedSp.includes(t))
                .map(t => `-<@${t.discordId}> ${ws.preferences.get(t.discordId)}${ws.leadPreferences.has(t.discordId) ? ' 🤚' : ''}${ws.playerSpNotes.has(t.discordId) ? ` ${ws.playerSpNotes.get(t.discordId)}` : ''}`)
                .join('\n')
            spString = Array.from(spGroupMembers)
                .map(([groupName, players]) => `**<@&${groupName}> ${ws.groupNotes.has(groupName) ? ` ${ws.groupNotes.get(groupName)}` : ''}:**\n --${Array.from(players)
                    .map(p => `${p} ${ws.playerSpNotes.has(p.id) ? ` ${ws.playerSpNotes.get(p.id)}` : ''}`).join('\n--')}\n`)
                .join('\n')
            if (unassignedSpString != "") spString = spString + "\n**Unassigned:**\n" + unassignedSpString
            spString == "" ? spString = "None" : spString

            //Generate Players string
            playersString = Array.from(ws.members)
                .map(t => {
                    if (t.timezone == "+0")
                        return `-<@${t.discordId}> (TOD: Not  set up)`
                    let today = new Date()
                    today = new Date(today.getTime() + today.getTimezoneOffset() * 60 * 1000);
                    today = new Date(today.getTime() + t.timezone * 60 * 60 * 1000);
                    return `-${afkMembers.get(t.discordId)}<@${t.discordId}> (TOD: ${today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })})`
                })
                .join('\n')
            playersString == "" ? playersString = "None" : playersString
        } else {
            //Generate Battleships string
            unassignedBsString = Array.from(ws.members)
                .filter(t => !assignedBs.includes(t))
                .map(t => `-${t.name} ${ws.preferences.get(t.discordId)}${ws.leadPreferences.has(t.discordId) ? ' 🤚' : ''}${ws.playerBsNotes.has(t.discordId) ? ` ${ws.playerBsNotes.get(t.discordId)}` : ''}`)
                .join('\n')

            bsString = Array.from(bsGroupMembers)
                .map(([groupName, players]) => `**<@&${groupName}> ${ws.groupNotes.has(groupName) ? ` ${ws.groupNotes.get(groupName)}` : ''}:**\n --${Array.from(players)
                    .map(p => `${ws.members.filter(t=> t.discordId == p.id)[0].name} ${ws.playerBsNotes.has(p.id) ? ` ${ws.playerBsNotes.get(p.id)}` : ''}`).join('\n--')}\n`)
                .join('\n')
            if (unassignedBsString != "") bsString = bsString + "\n**Unassigned:**\n" + unassignedBsString
            bsString == "" ? bsString = "None" : bsString

            //Generate Support string
            unassignedSpString = Array.from(ws.members)
                .filter(t => !assignedSp.includes(t))
                .map(t => `-${t.name} ${ws.preferences.get(t.discordId)}${ws.leadPreferences.has(t.discordId) ? ' 🤚' : ''}${ws.playerSpNotes.has(t.discordId) ? ` ${ws.playerSpNotes.get(t.discordId)}` : ''}`)
                .join('\n')
            spString = Array.from(spGroupMembers)
                .map(([groupName, players]) => `**<@&${groupName}> ${ws.groupNotes.has(groupName) ? ` ${ws.groupNotes.get(groupName)}` : ''}:**\n --${Array.from(players)
                 .map(p => `${ws.members.filter(t=> t.discordId == p.id)[0].name} ${ws.playerSpNotes.has(p.id) ? ` ${ws.playerSpNotes.get(p.id)}` : ''}`).join('\n--')}\n`)
                .join('\n')
            if (unassignedSpString != "") spString = spString + "\n**Unassigned:**\n" + unassignedSpString
            spString == "" ? spString = "None" : spString

            //Generate Players string
            playersString = Array.from(ws.members)
                .map(t => {
                    if (t.timezone == "+0")
                        return `-${t.name} (TOD: Not  set up)`
                    let today = new Date()
                    today = new Date(today.getTime() + today.getTimezoneOffset() * 60 * 1000);
                    today = new Date(today.getTime() + t.timezone * 60 * 60 * 1000);
                    return `-${afkMembers.get(t.discordId)}${t.name} (TOD: ${today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })})`
                })
                .join('\n')
            playersString == "" ? playersString = "None" : playersString
        }
        //Add members to embed
        statusEmbed.addField("Battleships:", bsString, true)
        statusEmbed.addField("Support:", spString, true)
        statusEmbed.addField("Player List", playersString)
    }
    statusEmbed.setColor(embedColors.get(ws.status))
        .setFooter(embedFooters.get(ws.status), message.guild.iconURL())
        .setTimestamp()
    return statusEmbed;
}

export const whiteStarCancelMessage = async (ws) => {
    let rolesEmbed = new Discord.MessageEmbed()
    rolesEmbed.setTitle(`White Star Status`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .setDescription(`${ws.description}`)
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Status:", "This WS Was Cancelled")
        .setColor("RED")

    return rolesEmbed;
}

export const killWS = async (client, ws, message) => {

    if (ws.retruitchannel) {
        let msg = await client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
        msg.edit("-", { embed: await whiteStarCancelMessage(ws) })
        msg.reactions.removeAll()
    }
    if (ws.statuschannel) {
        let statusmsg = await client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString());
        statusmsg.edit("-", { embed: await whiteStarCancelMessage(ws) })
        statusmsg.reactions.removeAll()
    }
    ws.members.forEach(async t => {
        let statusmsg = await client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString());
        let roleMember = await statusmsg.guild.members.fetch(t.discordId)
        roleMember.roles.remove(ws.wsrole)
        ws.bsGroupsRoles.forEach(async bsRole => {
            let roleMember = await statusmsg.guild.members.fetch(t.discordId)
            roleMember.roles.remove(bsRole)
        })
        ws.spGroupsRoles.forEach(async spGroupsRoles => {
            let roleMember = await statusmsg.guild.members.fetch(t.discordId)
            roleMember.roles.remove(spGroupsRoles)
        })
    })


    ws.remove();
}

export const RefreshStatusMessage = async (client, ws, interval) => {
    let intWs = await WhiteStar.findOne({ wsrole: ws.wsrole }).populate('author').populate('members').exec();
    let msgStatus;
    if (intWs) {
        if (interval) {
            if (intWs.status == "Recruiting") {
                clearInterval(interval);
            }
        }

        //Fetch old message
        if (!intWs.statuschannel || !intWs.statusmessage) { }
        else {
            msgStatus = await client.channels.cache.get(intWs.statuschannel).messages.fetch(intWs.statusmessage.toString());

            //Create new message
            const statusEmbed = await whiteStarStatusMessage(msgStatus, intWs);
            //Remove Reactions
            msgStatus.edit("-", { embed: statusEmbed })

            /*  if(intWs.status == "Running")
              {
                  //Check if to kill WS
                  let today = new Date()
                  let diffMs = 432000000 - (today - intWs.matchtime)
                  var diffDays = Math.floor(diffMs / 86400000); // days
                  var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  
                  if(diffMs <= 0) {
                      await killWS(client, intWs, msgStatus)
                  }
              }*/
        }
    }
    return msgStatus;
}

export const RefreshRecruitMessage = async (client, ws, interval) => {
    let intWs = await WhiteStar.findOne({ wsrole: ws.wsrole }).populate('author').populate('members').exec();
    let msgRecruit;
    if (intWs) {

        //Fetch old message
        let recruitChannel = await client.channels.cache.get(intWs.retruitchannel)
        if (recruitChannel) {
            msgRecruit = await recruitChannel.messages.fetch(intWs.recruitmessage.toString())
        }
        //Create new message
        const recruitEmbed = await whiteStarRecruitMessage(intWs);

        //Remove Reactions
        await msgRecruit.edit("-", { embed: recruitEmbed })
    }

    return msgRecruit;
}

export const StartTimerStatusRefresh = async (client, ws) => {
    let interval;
    interval = setInterval(function () {
        RefreshStatusMessage(client, ws, interval)
    }, 10 * 1000);
    return interval;
}