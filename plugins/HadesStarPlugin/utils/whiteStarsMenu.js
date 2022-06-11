import { Member, WhiteStar, WhiteStarRoles } from '../database';
import * as timeUtils from './timeUtils.js'
import { MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent, MessageSelectMenu } from 'discord.js';
import * as WsMessages from './whiteStarsMessages.js'
import * as WsUtils from './whiteStarsUtils.js'

export class WsConfigMenu {
    constructor(ws, client) {
        //Keep track so can check interactionCreated
        this.client = client
        this.ws = ws
    }

    getRow = async (b, message) => {
        //Save message
        this.message = message

        //Keep track so can check interactionCreated
        this.bDetailsID = b.id + 'details'
        this.bMembersID = b.id + 'members'
        this.bRolesID = b.id + 'roles'
        this.bTimeID = b.id + 'time'
        this.bDeleteID = b.id + 'delete'

        //Create buttons
        let bDetails = new MessageButton().setStyle(2).setLabel("Details").setCustomId(this.bDetailsID)
        let bMembers = new MessageButton().setStyle(2).setLabel("Members").setCustomId(this.bMembersID)
        let bRoles = new MessageButton().setStyle(2).setLabel("Roles").setCustomId(this.bRolesID)
        let bTime = new MessageButton().setStyle(2).setLabel("Time").setCustomId(this.bTimeID)
        let bDelete = new MessageButton().setStyle(1).setLabel("🚮").setCustomId(this.bDeleteID)
        let replyRow = new MessageActionRow()
        if (this.ws.status == "NotStarted") // No need to add/remove members before starting
            replyRow.addComponents([bDetails, bRoles, bTime, bDelete]);
        else
            replyRow.addComponents([bDetails, bMembers, bRoles, bTime, bDelete]);

        this.client.on('interactionCreate', async (interaction) => this.listenMenu(interaction))

        return replyRow
    }

    listenMenu = async (i) => {
        await i.deferUpdate()

        if (this.checkIfMainMenu(i.customId))
            return await this.listenMainMenu(i);

        else if (this.checkIfRolesMenu(i.customId))
            return await this.listenRolesMenu(i);

        //DetailsModal
        if (i.isModalSubmit())
            await this.listenDetailsModal(i);

    }



    // Main Menu
    checkIfMainMenu = (id) => {
        let idsToCheck = [this.bDetailsID, this.bMembersID, this.bRolesID, this.bTimeID, this.bDeleteID]
        return idsToCheck.includes(id)
    }

    listenMainMenu = async (i) => {
        //Details
        if (i.customId == this.bDetailsID) {   //Open details modal
            this.mDetailsID = i.id + "-detailsModal"
            return await i.showModal(this.createDetailsModal()) // Show modal as response
        }
        else if (i.customId == this.bMembersID) { //Open 2 buttons for add and remove members (WIP)
            this.bAddMemberID = i.id + 'bAddMemberID'
            this.bRemoveMemberID = i.id + 'bRemoveMemberID'
            //Create buttons
            let bAddMember = new MessageButton().setStyle(2).setLabel("Details").setCustomId(this.bAddMemberID)
            let bRemoveMember = new MessageButton().setStyle(2).setLabel("Members").setCustomId(this.bRemoveMemberID)
            const membersrow = new MessageActionRow().addComponents([bAddMember, bRemoveMember]);
            return await i.editReply({ content: "Select add or remove member", components: [membersrow] }) //Add bottons as response
        }
        else if (i.customId == this.bRolesID) {  //Groups Embeed

            this.bAddRoleID = i.id + 'bAddRoleID'
            this.bRemoveRoleID = i.id + 'bRemoveRoleID'
            //Show roles
            let rolesEmbed = new MessageEmbed()
                .setTitle(`Whitestar ships roles`)
                .setThumbnail("https://i.imgur.com/fNtJDNz.png")
                .setColor("GREEN")
                .setFooter({ text: `use &srolesws @wsrole bs/sp @role` })
                .addField("Whitestar", `<@&${this.ws.wsrole}>`)
            let bsString = "";

            let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()

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
            let bAddRole = new MessageButton().setStyle(3).setLabel("Add").setCustomId(this.bAddRoleID)
            let bRemoveRole = new MessageButton().setStyle(4).setLabel("Remove").setCustomId(this.bRemoveRoleID)
            const rolessetupRow = new MessageActionRow().addComponents([bAddRole, bRemoveRole]);

            return await i.editReply({ embeds: [rolesEmbed], components: [rolessetupRow] }) //add rows and roles as response
        } else if (i.customId == this.bTimeID) {
            return await i.editReply({ content: "time WIP", components: [] })
        } else if (i.customId == this.bDeleteID) {
            WsUtils.killWS(this.client, this.ws)
            return await i.editReply({ content: "WS Deleted", components: [] })
        }
    }

    // Details
    createDetailsModal = () => {
        const modal = new Modal().setCustomId(this.mDetailsID).setTitle('Configure the whitestar');
        const descriptionInput = new TextInputComponent().setCustomId('descriptionInput')
            .setLabel("Description:")
            .setStyle('PARAGRAPH')
            .setPlaceholder(this.ws.description)
        const corporationInput = new TextInputComponent().setCustomId('corporationInput')
            .setLabel("Corporation")
            .setStyle('SHORT')
            .setPlaceholder(this.ws.corporation)

        const natureInput = new TextInputComponent().setCustomId('natureInput')
            .setLabel("Nature")
            .setStyle('SHORT')
            .setPlaceholder(this.ws.nature)

        const firstActionRow = new MessageActionRow().addComponents(corporationInput);
        const secondActionRow = new MessageActionRow().addComponents(natureInput);
        const thirdActionRow = new MessageActionRow().addComponents(descriptionInput);
        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        return modal
    }

    listenDetailsModal = async (i) => {
        if (i.customId == this.mDetailsID) {
            let descriptionInput = i.fields.getTextInputValue('descriptionInput');
            let corporationInput = i.fields.getTextInputValue('corporationInput');
            let natureInput = i.fields.getTextInputValue('natureInput');
            this.ws.description = descriptionInput != "" ? descriptionInput : this.ws.description
            this.ws.corporation = corporationInput != "" ? corporationInput : this.ws.corporation
            this.ws.nature = natureInput != "" ? natureInput : this.ws.nature
            await this.ws.save()
            WsUtils.RefreshRecruitMessage(this.client, this.ws)
            return await i.editReply({ content: "Details updated.", components: [] })
        }
    }

    //Roles
    checkIfRolesMenu = (id) => {
        let idsToCheck = [this.bAddRoleID, this.bRemoveRoleID, this.bsGroupRemoveMenuID]
        return idsToCheck.includes(id)
    }

    listenRolesMenu = async (i) => {
        if (i.customId == this.bAddRoleID) { //not main menu anymore
            return await i.editReply({ content: `use &srolesws @wsrole bs/sp @role`, embeds: [], components: [] })
        } else if (i.customId == this.bRemoveRoleID) {
            this.bsGroupRemoveMenuID = i.id + "bsGroupRemoveMenuID"
            this.spGroupRemoveMenuID = i.id + "bsGrouspGroupRemoveMenuIDpRemoveMenuID"
            //Remove Role
            //battleship
            let bsGroupRemoveMenu = new MessageSelectMenu().setCustomId(this.bsGroupRemoveMenuID)
                .setPlaceholder('Select battleship group')
            let spGroupRemoveMenu = new MessageSelectMenu().setCustomId(this.spGroupRemoveMenuID)
                .setPlaceholder('Select support group')

            let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()

            groupsRoles.bsGroupsRoles.forEach(m => {
                bsGroupRemoveMenu.addOptions([
                    {
                        label: this.message.guild.roles.cache.find(r => r.id == m).name,
                        value: m,
                    }
                ])
            });
            groupsRoles.spGroupsRoles.forEach(m => {
                spGroupRemoveMenu.addOptions([
                    {
                        label: this.message.guild.roles.cache.find(r => r.id == m).name,
                        value: m,
                    }
                ])
            });
            let rows = []
            let groupMenusRow1 = new MessageActionRow()
            let groupMenusRow2 = new MessageActionRow()
            if (groupsRoles.bsGroupsRoles.length > 0) {
                groupMenusRow1.addComponents(bsGroupRemoveMenu)
                rows.push(groupMenusRow1)
            }
            if (groupsRoles.spGroupsRoles.length > 0) {
                groupMenusRow2.addComponents(spGroupRemoveMenu)
                rows.push(groupMenusRow2)
            }
            return await i.editReply({ content: `Select which roles to remove`, embeds: [], components: rows })
        }
         else if (i.isSelectMenu()) {
            //Remove roles handling
            if (i.customId == this.bsGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.editReply({ content: `<@&${roleToRemove}> Battleship group removed`, embeds: [], components: [] })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()
                groupsRoles.bsGroupsRoles = groupsRoles.bsGroupsRoles.filter(m => m != roleToRemove)
                return await groupsRoles.save()
            } else if (i.customId == this.spGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.editReply({ content: `<@&${roleToRemove}> Support group removed`, embeds: [], components: [] })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()
                groupsRoles.spGroupsRoles = groupsRoles.spGroupsRoles.filter(m => m != roleToRemove)
                return await groupsRoles.save()
            }
        }
    }
}

