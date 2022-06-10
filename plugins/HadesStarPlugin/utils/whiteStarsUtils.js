import { Member, WhiteStar, WhiteStarRoles } from '../database';
import * as timeUtils from './timeUtils.js'
import { MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent, MessageSelectMenu } from 'discord.js';
export let NormalShow = true
import * as WsMessages from './whiteStarsMessages.js'

//Recruit

export const recruitCollector = async (client, message, ws) => {

    const filter = (button) => button.user.bot == false;
    const collector = message.createMessageComponentCollector({ filter });

    //Keep track so can check interactionCreated
    let bDetailsID = null
    let bMembersID = null
    let bRolesID = null
    let bTimeID = null
    let bDeleteID = null

    let mDetailsID = null

    let bAddMemberID = null
    let bRemoveMemberID = null

    let bAddRoleID = null
    let bRemoveRoleID = null

    let bsGroupRemoveMenuID = null
    let spGroupRemoveMenuID = null

    collector.on('collect', async b => {
        if (b.user.id == ws.author.discordId) {
            if (b.customId == "setup") {
                //Keep track so can check interactionCreated
                bDetailsID = b.id + 'details'
                bMembersID = b.id + 'members'
                bRolesID = b.id + 'roles'
                bTimeID = b.id + 'time'
                bDeleteID = b.id + 'delete'

                //Create buttons
                let bDetails = new MessageButton().setStyle(2).setLabel("Details").setCustomId(bDetailsID)
                let bMembers = new MessageButton().setStyle(2).setLabel("Members").setCustomId(bMembersID)
                let bRoles = new MessageButton().setStyle(2).setLabel("Roles").setCustomId(bRolesID)
                let bTime = new MessageButton().setStyle(2).setLabel("Time").setCustomId(bTimeID)
                let bDelete = new MessageButton().setStyle(1).setLabel("🚮").setCustomId(bDeleteID)
                let replyRow = new MessageActionRow()
                if (ws.status == "NotStarted") // No need to add/remove members before starting
                    replyRow.addComponents([bDetails, bRoles, bTime, bDelete]);
                else
                    replyRow.addComponents([bDetails, bMembers, bRoles, bTime, bDelete]);

                await b.reply({ components: [replyRow], ephemeral: true })
            } else if (b.customId == "start") {
                await b.reply({ content: 'Start', ephemeral: true })
            }
        } else {
            await b.reply({ content: 'You cant setup this whitestar.', ephemeral: true })
        }
    })

    client.on('interactionCreate', async (i) => {

        if (i.customId == bDetailsID) {
            //Open modal
            // Create the modal
            mDetailsID = i.id + "-detailsModal"
            const modal = new Modal().setCustomId(mDetailsID).setTitle('Configure the whitestar');
            const descriptionInput = new TextInputComponent().setCustomId('descriptionInput')
                .setLabel("Description:")
                .setStyle('PARAGRAPH')
                .setPlaceholder(ws.description)
            const corporationInput = new TextInputComponent().setCustomId('corporationInput')
                .setLabel("Corporation")
                .setStyle('SHORT')
                .setPlaceholder(ws.corporation)

            const natureInput = new TextInputComponent().setCustomId('natureInput')
                .setLabel("Nature")
                .setStyle('SHORT')
                .setPlaceholder(ws.nature)

            const firstActionRow = new MessageActionRow().addComponents(corporationInput);
            const secondActionRow = new MessageActionRow().addComponents(natureInput);
            const thirdActionRow = new MessageActionRow().addComponents(descriptionInput);
            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await i.showModal(modal)

            //    await i.update({ content: "detailsWIP", components: [] })
        } else if (i.customId == bMembersID) {
            bAddMemberID = i.id + 'bAddMemberID'
            bRemoveMemberID = i.id + 'bRemoveMemberID'
            //Create buttons
            let bAddMember = new MessageButton().setStyle(2).setLabel("Details").setCustomId(bAddMemberID)
            let bRemoveMember = new MessageButton().setStyle(2).setLabel("Members").setCustomId(bRemoveMemberID)
            const membersrow = new MessageActionRow().addComponents([bAddMember, bRemoveMember]);
            await i.update({ content: "Select add or remove member", components: [membersrow] })
        } else if (i.customId == bRolesID) {

            bAddRoleID = i.id + 'bAddRoleID'
            bRemoveRoleID = i.id + 'bRemoveRoleID'
            //Show roles
            let rolesEmbed = new MessageEmbed()
                .setTitle(`Whitestar ships roles`)
                .setThumbnail("https://i.imgur.com/fNtJDNz.png")
                .setColor("GREEN")
                .setFooter({ text: `use &srolesws @wsrole bs/sp @role` })
                .addField("Whitestar", `<@&${ws.wsrole}>`)
            let bsString = "";

            let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: ws.wsrole }).exec()

            groupsRoles.bsGroupsRoles.forEach(role => {
                bsString += `<@&${role}>\n`
            })

            if (bsString == "") bsString = "None";
            rolesEmbed.addField("Battle Ships:", bsString)

            let spString = "";

            groupsRoles.spGroupsRoles.forEach(role => {
                spString += `<@&${role}>\n`
            })


            if (spString == "") spString = "None";
            rolesEmbed.addField("Support Ships:", spString)

            //buttons
            let bAddRole = new MessageButton().setStyle(3).setLabel("Add").setCustomId(bAddRoleID)
            let bRemoveRole = new MessageButton().setStyle(4).setLabel("Remove").setCustomId(bRemoveRoleID)
            const rolessetupRow = new MessageActionRow().addComponents([bAddRole, bRemoveRole]);

            await i.update({ embeds: [rolesEmbed], components: [rolessetupRow] })
        } else if (i.customId == bTimeID) {
            await i.update({ content: "time WIP", components: [] })
        } else if (i.customId == bDeleteID) {
            killWS(client, ws)
            await i.update({ content: "WS Deleted", components: [] })
        }
        else if (i.customId == bAddRoleID) { //not main menu anymore
            await i.update({ content: `use &srolesws @wsrole bs/sp @role`, embeds: [], components: [] })
        } else if (i.customId == bRemoveRoleID) {
            bsGroupRemoveMenuID = i.id + "bsGroupRemoveMenuID"
            spGroupRemoveMenuID = i.id + "bsGrouspGroupRemoveMenuIDpRemoveMenuID"
            //Remove Role
            //battleship
            let bsGroupRemoveMenu = new MessageSelectMenu().setCustomId(bsGroupRemoveMenuID)
                .setPlaceholder('Select battleship group')
            let spGroupRemoveMenu = new MessageSelectMenu().setCustomId(spGroupRemoveMenuID)
                .setPlaceholder('Select support group')

            let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: ws.wsrole }).exec()

            groupsRoles.bsGroupsRoles.forEach(m => {
                bsGroupRemoveMenu.addOptions([
                    {
                        label: message.guild.roles.cache.find(r => r.id == m).name,
                        value: m,
                    }
                ])
            });
            groupsRoles.spGroupsRoles.forEach(m => {
                spGroupRemoveMenu.addOptions([
                    {
                        label: message.guild.roles.cache.find(r => r.id == m).name,
                        value: m,
                    }
                ])
            });
            let rows = []
            let groupMenusRow1 = new MessageActionRow()
            let groupMenusRow2 = new MessageActionRow()
            if(groupsRoles.bsGroupsRoles.length>0)
            {
            groupMenusRow1.addComponents(bsGroupRemoveMenu)
            rows.push(groupMenusRow1)
            }
            if(groupsRoles.spGroupsRoles.length>0)
            {
            groupMenusRow2.addComponents(spGroupRemoveMenu)
            rows.push(groupMenusRow2)
            }
            await i.update({ content: `Select which roles to remove`, embeds: [], components: rows })
        }

        if (i.isSelectMenu()) {
            //Remove roles handling
            if (i.customId == bsGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.update({ content: `<@&${roleToRemove}> Battleship group removed`, embeds: [], components: [] })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: ws.wsrole }).exec()
                groupsRoles.bsGroupsRoles = groupsRoles.bsGroupsRoles.filter(m => m != roleToRemove)
                await groupsRoles.save()
            } else if (i.customId == spGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.update({ content: `<@&${roleToRemove}> Support group removed`, embeds: [], components: [] })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: ws.Corp, wsrole: ws.wsrole }).exec()
                groupsRoles.spGroupsRoles = groupsRoles.spGroupsRoles.filter(m => m != roleToRemove)
                await groupsRoles.save()
            }


        }

        //Modal
        if (i.customId == mDetailsID) {
            let descriptionInput = i.fields.getTextInputValue('descriptionInput');
            let corporationInput = i.fields.getTextInputValue('corporationInput');
            let natureInput = i.fields.getTextInputValue('natureInput');
            ws.description = descriptionInput != "" ? descriptionInput : ws.description
            ws.corporation = corporationInput != "" ? corporationInput : ws.corporation
            ws.nature = natureInput != "" ? natureInput : ws.nature
            await ws.save()
            RefreshRecruitMessage(client, ws)
            await i.update({ content: "Details updated.", components: [] })
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