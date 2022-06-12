import { Member, WhiteStar, WhiteStarRoles } from '../database';
import * as timeUtils from './timeUtils.js'
import { MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent, MessageSelectMenu } from 'discord.js';
export let NormalShow = true
import * as WsMessages from './whiteStarsMessages.js'
import { WsConfigMenu } from './whiteStarsMenu.js'
//Recruit

export const recruitCollector = async (client, message, ws) => {


    const filter = (button) => button.user.bot == false;
    const collector = message.createMessageComponentCollector({ filter });

    let wsConfigMenu = new WsConfigMenu(ws, client)

    collector.on('collect', async b => {
        await b.deferUpdate()

        if (b.customId == "setup") {
            if (b.user.id == ws.author.discordId) {
                //let menuRow = await WsMenu.startMenu(client,message,ws)
                let menuRow = await wsConfigMenu.getRow(b, message)
                await b.followUp({ components: [menuRow], ephemeral: true })
            } else {
                await b.followUp({ content: 'You cant setup this whitestar.', ephemeral: true })
            }
        } else if (b.customId == "start") {
            if (b.user.id == ws.author.discordId) {
                if (ws.description == "") {
                    return await b.followUp({ content: "Please setup a description for the whitestar.", ephemeral: true })
                }
                //change to recruiting
                ws.status = "Recruiting"
                await ws.save()

                //Refresh embed
                const recruitEmbed = await WsMessages.whiteStarRecruitMessage(ws)
                const recruitButtons = await WsMessages.whiteStarRecruitButtons(ws)

                //add the menu buttons
                await message.edit({ embeds: [recruitEmbed], components: recruitButtons })
            } else {
                await b.followUp({ content: 'You cant setup this whitestar.', ephemeral: true })
            }
        } else if (b.customId == "endrecruit") {
            if (b.user.id == ws.author.discordId) {
                //change to recruiting
                ws.status = "WaitForScan"
                await ws.save()
                //Refresh embed
                const recruitEmbed = await WsMessages.whiteStarRecruitMessage(ws)
                const recruitButtons = await WsMessages.whiteStarRecruitButtons(ws)

                //add the menu buttons
                await message.edit({ embeds: [recruitEmbed], components: recruitButtons })
            } else {
                await b.followUp({ content: 'You cant setup this whitestar.', ephemeral: true })
            }
        } else if (b.customId == '🤚') {
            let member = await Member.findOne({ discordId: b.user.id.toString() }).exec();
            if (ws.leadPreferences.has(member.discordId)) { //If member is commander
                ws.leadPreferences.delete(member.discordId)
            } else {
                ws.leadPreferences.set(member.discordId, '🤚')
            }
            //Refresh embed
            const recruitEmbed = await WsMessages.whiteStarRecruitMessage(ws)
            const recruitButtons = await WsMessages.whiteStarRecruitButtons(ws)

            //add the menu buttons
            await message.edit({ embeds: [recruitEmbed], components: recruitButtons, ephemeral: true })

        } else if (b.customId == '🆘') {
            WsMessages.SetNormal(!WsMessages.NormalShow)
            //Refresh embed
            const recruitEmbed = await WsMessages.whiteStarRecruitMessage(ws)
            const recruitButtons = await WsMessages.whiteStarRecruitButtons(ws)

            //add the menu buttons
            await message.edit({ embeds: [recruitEmbed], components: recruitButtons, ephemeral: true })

        } else

            if (WsMessages.whiteStarPrefEmojiGroup.get(b.customId)) {
                let member = await Member.findOne({ discordId: b.user.id.toString() }).exec();
                let groupName = b.customId
                //join the whitestar

                let roleMember = await message.guild.members.fetch(member.discordId)
                if (ws.preferences.has(member.discordId)) { //If player already an emoji
                    if (ws.preferences.get(member.discordId) == groupName) { //If it has the one selected
                        //Delist
                        let remainingMembers = await ws.members.filter(m => m.discordId != member.discordId)
                        ws.members = remainingMembers
                        ws.preferences.delete(member.discordId)
                        ws.leadPreferences.delete(member.discordId)
                        roleMember.roles.remove(ws.wsrole)
                    } else {
                        //Change
                        ws.preferences.set(member.discordId, groupName)
                        roleMember.roles.add(ws.wsrole)
                    }
                } else {
                    ws.members.push(member)
                    ws.preferences.set(member.discordId, groupName)
                    roleMember.roles.add(ws.wsrole)
                }
                await ws.save()

                //Refresh embed
                const recruitEmbed = await WsMessages.whiteStarRecruitMessage(ws)
                const recruitButtons = await WsMessages.whiteStarRecruitButtons(ws)

                //add the menu buttons
                await message.edit({ embeds: [recruitEmbed], components: recruitButtons, ephemeral: true })
            }
    })


}

export const RefreshRecruitMessage = async (client, ws, interval) => {
    let intWs = await WhiteStar.findOne({ wsrole: ws.wsrole }).populate('author').populate('members').populate('groupsRoles').exec();
    let msgRecruit;
    if (intWs) {

        //Fetch old message
        let recruitChannel = await client.channels.cache.get(intWs.retruitchannel)
        if (recruitChannel) {
            msgRecruit = await recruitChannel.messages.fetch(intWs.recruitmessage.toString())
        }
        //Create new message
        const recruitEmbed = await WsMessages.whiteStarRecruitMessage(intWs);

        //Remove Reactions
        await msgRecruit.edit({ embeds: [recruitEmbed] })
    }

    return msgRecruit;
}


//Status




const RefreshStatusMessage = async (client, ws, interval) => {
    /*let intWs = await WhiteStar.findOne({ wsrole: ws.wsrole }).populate('author').populate('members').populate('groupsRoles').exec();
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
            msgStatus.edit( {embeds: [statusEmbed] })
        }
    }
    return msgStatus;*/
}

//Both
export const killWS = async (client, ws) => {

    if (ws.retruitchannel) {
        let msg = await client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
        msg.edit({ embeds: [await WsMessages.whiteStarCancelMessage(ws)], components: [] })
        msg.reactions.removeAll()
    }
    if (ws.statuschannel) {
        let statusmsg = await client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString());
        statusmsg.edit({ embeds: [await whiteStarCancelMessage(ws)] })
        statusmsg.reactions.removeAll()
    }
    ws.members.forEach(async t => {
        let statusmsg = await client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
        let roleMember = await statusmsg.guild.members.fetch(t.discordId)
        roleMember.roles.remove(ws.wsrole)
        ws.groupsRoles.bsGroupsRoles.forEach(async bsRole => {
            let roleMember = await statusmsg.guild.members.fetch(t.discordId)
            roleMember.roles.remove(bsRole)
        })
        ws.groupsRoles.spGroupsRoles.forEach(async spGroupsRoles => {
            let roleMember = await statusmsg.guild.members.fetch(t.discordId)
            roleMember.roles.remove(spGroupsRoles)
        })
    })


    ws.remove();
}
export const StartTimerStatusRefresh = async (client, ws) => {
    let interval;
    interval = setInterval(function () {
        RefreshStatusMessage(client, ws, interval)
    }, 10 * 1000);
    return interval;
}