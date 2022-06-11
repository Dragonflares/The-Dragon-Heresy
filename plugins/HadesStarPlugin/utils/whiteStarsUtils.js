import { Member, WhiteStar, WhiteStarRoles } from '../database';
import * as timeUtils from './timeUtils.js'
import { MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent, MessageSelectMenu } from 'discord.js';
export let NormalShow = true
import * as WsMessages from './whiteStarsMessages.js'
import {WsConfigMenu} from './whiteStarsMenu.js'
//Recruit

export const recruitCollector = async (client, message, ws) => {


    const filter = (button) => button.user.bot == false;
    const collector = message.createMessageComponentCollector({ filter });

    let wsConfigMenu = new WsConfigMenu(ws, client)
    
    collector.on('collect', async b => {
        await b.deferUpdate()
        if (b.user.id == ws.author.discordId) {
            if (b.customId == "setup") {
                //let menuRow = await WsMenu.startMenu(client,message,ws)
                let menuRow = await wsConfigMenu.getRow(b,message)
                await b.followUp({ components: [menuRow], ephemeral: true })
            } else if (b.customId == "start") {
                await b.followUp({ content: 'Start', ephemeral: true })
            }
        } else {
            await b.followUp({ content: 'You cant setup this whitestar.', ephemeral: true })
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




/*const RefreshStatusMessage = async (client, ws, interval) => {
    let intWs = await WhiteStar.findOne({ wsrole: ws.wsrole }).populate('author').populate('members').populate('groupsRoles').exec();
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
    return msgStatus;
}
*/
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
        let statusmsg = await client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString());
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