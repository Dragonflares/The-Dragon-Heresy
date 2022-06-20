import { Manager } from '../../../lib';
import { Member, WhiteStar, Corp } from '../database';
import * as WsUtils from '../utils/whiteStarsUtils.js'
import * as WsMessages from '../utils/whiteStarsMessages.js'
import * as WsMenu from '../utils/whiteStarsMenu.js'
export class WhiteStarsManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable = async () => {
        if (!this.enabled) {
            //Refresh Timers
            await this.timersStart();
            await this.reListen()
        }
        super.enable();
    }

    reListen = async () => {
        await this.client.guilds.fetch()
        let wss = await WhiteStar.find().populate('author').populate('members').populate('groupsRoles').exec();
        wss.forEach(async ws => {

            //Listen to recruit
            let wsMessage = ws.recruitmessage
            let wsChannel = ws.retruitchannel
            if (wsMessage && wsChannel) {
                try {
                    let messageReaction = await this.client.channels.cache.get(wsChannel).messages.fetch(wsMessage);
                    if (messageReaction)
                        WsUtils.recruitCollector(this.client, messageReaction, ws)
                } catch (e) { }
            }
            //Listen to status
            let wsStatusMessage = ws.statusmessage
            let wsStatusChannel = ws.statuschannel
            if (wsStatusMessage && wsStatusChannel) {
                try {
                    let messageReaction = await this.client.channels.cache.get(wsStatusChannel).messages.fetch(wsStatusMessage);
                    if (messageReaction)
                        WsUtils.statusCollector(this.client, messageReaction, ws)
                } catch (e) { }
            }
        })
    }

    timersStart = async () => {
        let ws = await WhiteStar.find({ $or: [{ status: "Scanning" }, { status: "WaitForScan" }, { status: "Running" }] }).populate('author').populate('members').exec();
        ws.forEach(t => WsUtils.StartTimerStatusRefresh(this.client, t))
    }

    /*reactListener = async (messageReaction, user) => {
        if (user.bot) return;

        //Remove Reaction


        //ws react
        let ws = await WhiteStar.findOne({ $or: [{ recruitmessage: messageReaction.message.id }, { statusmessage: messageReaction.message.id }] }).populate('author').populate('members').populate('groupsRoles').exec();
        if (ws) {
            if (ws.recruitmessage == messageReaction.message.id) {   //Recruit
                messageReaction.users.remove(user);
                await this.recruitListener(ws, messageReaction, user);
            } else if (ws.statusmessage == messageReaction.message.id) { //Status
                messageReaction.users.remove(user);
                await this.statusListener(ws, messageReaction, user);
            }
        }
    }

    statusListener = async (ws, messageReaction, user) => {
        let corp = await Corp.findOne({ corpId: messageReaction.message.guild.id.toString() }).populate('rankRoles').exec();
        let userRect = messageReaction.message.guild.members.cache.get(user.id)
        let allowed = (user.id == ws.author.discordId) || userRect.roles.cache.find(r => r == corp.rankRoles.Officer)

        if (messageReaction.emoji.name == '🚮') {  //If Trash
            if (allowed) { //If Author
                await WsUtils.killWS(this.client, ws, messageReaction.message)
                return;
            }
        }
        if (messageReaction.emoji.name == '🆘') { //invalid users
            WsUtils.SetNormal(!WsUtils.NormalShow)
        }
        if (allowed && WsUtils.whiteStarStatusReactions.get(ws.status).includes(messageReaction.emoji.name)) {
            if (ws.status == "WaitForScan") {

                if (messageReaction.emoji.name == '⬅️') { // Return to recruit
                    //Remove reactions
                    messageReaction.message.reactions.removeAll()
                    ws.status = "Recruiting"
                    await ws.save()

                    //React Status
                    WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.message.react(react))

                    //Create new message
                    const recruitEmbed = await WsUtils.whiteStarRecruitMessage(ws);

                    //Fetch recruit message
                    let msgRecruit = await this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());

                    //Send Reactions Recruit
                    WsUtils.whiteStarPrefEmojiGroup.forEach(async (value, key) => await msgRecruit.react(key))
                    WsUtils.whiteStarRecruitReactions.forEach(async react => await msgRecruit.react(react))

                    //Edit old message
                    msgRecruit.edit(recruitEmbed)

                } else if (messageReaction.emoji.name == '✅') { //Scan Started
                    //Remove reactions
                    messageReaction.message.reactions.removeAll()
                    ws.status = "Scanning"
                    ws.scantime = new Date();
                    await ws.save()
                    WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.message.react(react))
                    WsUtils.RefreshStatusMessage(this.client, ws, null);
                    WsUtils.StartTimerStatusRefresh(this.client, ws);
                }
            } else if (ws.status == "Scanning") {
                if (messageReaction.emoji.name == '🛑') { // Stop Scan
                    messageReaction.message.reactions.removeAll()
                    ws.status = "WaitForScan"
                    await ws.save()
                    WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.message.react(react))
                } else if (messageReaction.emoji.name == '✅') { //found
                    messageReaction.message.reactions.removeAll()
                    ws.status = "Running"
                    ws.matchtime = new Date();
                    await ws.save()
                    WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.message.react(react))
                }
            } else if (ws.status == "Running") {
                if (messageReaction.emoji.name == '⬅️') {  //Oops back to scan
                    messageReaction.message.reactions.removeAll()
                    ws.status = "Scanning"
                    await ws.save()
                    WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => await messageReaction.message.react(react))
                } else if (messageReaction.emoji.name == '🕙') { //-10
                    ws.matchtime = new Date(ws.matchtime.getTime() + 600000);
                    await ws.save()
                } else if (messageReaction.emoji.name == '🕚') { //-1
                    ws.matchtime = new Date(ws.matchtime.getTime() + 60000);
                    await ws.save()
                } else if (messageReaction.emoji.name == '🕐') { //1
                    ws.matchtime = new Date(ws.matchtime.getTime() - 60000);
                    await ws.save()
                } else if (messageReaction.emoji.name == '🕑') { //10
                    ws.matchtime = new Date(ws.matchtime.getTime() - 600000);
                    await ws.save()
                }

            }

            WsUtils.RefreshStatusMessage(this.client, ws, null);
        }
    }*/

    /*   recruitListener = async (ws, messageReaction, user) => {
           //Get reacted member
           let member = await Member.findOne({ discordId: user.id.toString() }).exec();
           if (!WsUtils.whiteStarRecruitReactions.includes(messageReaction.emoji.name) && !WsUtils.whiteStarPrefEmojiGroup.has(messageReaction.emoji.name)) return;
           if (messageReaction.emoji.name == '🆘') { //invalid users
               WsUtils.SetNormal(!WsUtils.NormalShow)
           }
   
           //Let officers change stuff
           
           let corp = await Corp.findOne({ corpId: messageReaction.message.guild.id.toString() }).populate('rankRoles').exec();
           let userRect = messageReaction.message.guild.members.cache.get(user.id)
           let allowed = (user.id == ws.author.discordId) || userRect.roles.cache.find(r => r == corp.rankRoles.Officer)
           if (messageReaction.emoji.name == '🚮') {  //If Trash
   
               if (allowed) { //If Author
                   await WsUtils.killWS(this.client, ws, messageReaction.message)
                   return;
               }
           } else if (messageReaction.emoji.name == '🤚') { //If commander
               if (ws.leadPreferences.has(member.discordId)) { //If member is commander
                   ws.leadPreferences.delete(member.discordId)
               } else {
                   ws.leadPreferences.set(member.discordId, '🤚')
               }
           } else if (messageReaction.emoji.name == '✅') { //If done
               if (allowed) { //If Author
                   ws.status = "WaitForScan"
                   messageReaction.message.reactions.removeAll()
                   if (ws.statuschannel) //Update status message
                   {
                       //Create new message
                       const statusEmbed = await WsUtils.whiteStarStatusMessage(messageReaction.message, ws);
   
                       //Fetch old message
                       let msgStatus = await this.client.channels.cache.get(ws.statuschannel).messages.fetch(ws.statusmessage.toString());
   
                       //Send Reactions
                       WsUtils.whiteStarStatusReactions.get(ws.status).forEach(async react => msgStatus.react(react))
   
                       //Edit old message
                       msgStatus.edit({ embeds: [statusEmbed] })
                   }
               }
           } else if (WsUtils.whiteStarPrefEmojiGroup.has(messageReaction.emoji.name)) { //If Valid Emoji
               let roleMember = await messageReaction.message.guild.members.fetch(member.discordId)
               if (ws.preferences.has(member.discordId)) { //If player already an emoji
                   if (ws.preferences.get(member.discordId) == messageReaction.emoji.name) { //If it has the one selected
                       //Delist
                       let remainingMembers = await ws.members.filter(m => m.discordId != member.discordId)
                       ws.members = remainingMembers
                       ws.preferences.delete(member.discordId)
                       ws.leadPreferences.delete(member.discordId)
                       roleMember.roles.remove(ws.wsrole)
                   } else {
                       //Change
                       ws.preferences.set(member.discordId, messageReaction.emoji.name)
                       roleMember.roles.add(ws.wsrole)
                   }
               } else {
                   ws.members.push(member)
                   ws.preferences.set(member.discordId, messageReaction.emoji.name)
                   roleMember.roles.add(ws.wsrole)
               }
   
           }
           await ws.save()
   
           //Create new message
           const rolesEmbed = await WsUtils.whiteStarRecruitMessage(ws);
   
           //Edit old message
           messageReaction.message.edit({ embeds: [rolesEmbed] })
       }*/

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}