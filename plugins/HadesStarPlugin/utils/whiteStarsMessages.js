import { Member, WhiteStar, WhiteStarRoles } from '../database';
import * as timeUtils from './timeUtils.js'
import { MessageEmbed, MessageButton, MessageActionRow } from 'discord.js';
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
    ["NotStarted", "Not started yet!"],
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
export const SetNormal = async (normal) => {
    NormalShow = normal;
}


//Recruit

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
            if (NormalShow) {
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
    let rolesEmbed = new MessageEmbed()
        .setTitle(`White Star Recruitment by ${ws.author.name}:`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Description:", ws.description != "" ? ws.description : "Not setup")
        .addField("Corporation:", ws.corporation != "" ? ws.corporation : "Not setup", true)
        .addField("Nature:", ws.nature != "" ? ws.nature : "Not setup", true)
        .addField("Expected Time:", ws.expectedtime ? ws.expectedtime : "Not setup", true)

    //Footers
    if (ws.status == "NotStarted") {
        rolesEmbed.setColor("GREEN")
            .setFooter({ text: `Press Start to beign Recruit` })
    }
    else if (ws.status == "Recruiting") {
        rolesEmbed.addField("Current People", ws.members ? Object.keys(ws.members).length.toString() : "0")

        //Add Categories and players
        whiteStarPrefEmojiGroup.forEach((value, key) =>
            rolesEmbed.addField(`${key} ${value}`, prefCatStrings.get(value), true))
        rolesEmbed.setColor("ORANGE")
            .setFooter({ text: `🤚 - Commander  🆘 - Switch to text mode 🚮 - Stop Recruit ✅ - Finish Recruit` })
    }
    else {
        rolesEmbed.setColor("GREEN")
            .setFooter({ text: `Recruitment Done` })
    }
    return rolesEmbed;

}


export const whiteStarCancelMessage = async (ws) => {
    let rolesEmbed = new MessageEmbed()
    rolesEmbed.setTitle(`White Star Status`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .setDescription(`${ws.description}`)
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Status:", "This WS Was Cancelled")
        .setColor("RED")

    return rolesEmbed;
}

//Status
/*
export const whiteStarStatusMessage = async (message, ws) => {
    //Create Message
    let statusEmbed = new MessageEmbed()

    //Set Common Items
    statusEmbed.setTitle(`White Star Status`)
        .setThumbnail("https://i.imgur.com/fNtJDNz.png")
        .addField("Group:", `<@&${ws.wsrole}>`)
        .addField("Status:", embedTitles.get(ws.status))
    if (ws.status == "Scanning") {
        //calculate delta time
        let today = new Date()
        let {diffDays, diffHrs, diffMins } = timeUtils.timeDiff(today, ws.scantime);
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
        //let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: ws.wsrole }).exec()

        //console.log(groupsRoles.bsGroupsRoles)
        if(ws.groupsRoles.bsGroupsRoles){
        //Fill groups
        await Promise.all(ws.groupsRoles.bsGroupsRoles.map(async role => {
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
    }
    if(ws.groupsRoles.bsGroupsRoles){
        await Promise.all(ws.groupsRoles.spGroupsRoles.map(async role => {
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
    }
        let unassignedBsString
        let bsString
        let unassignedSpString
        let spString
        let playersString
        if (NormalShow) {
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
        .setFooter({text: `${embedFooters.get(ws.status)}`, iconURL: message.guild.iconURL()})
        .setTimestamp()
    return statusEmbed;
}
*/