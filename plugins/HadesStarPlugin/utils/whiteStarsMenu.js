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
        this.listening =false
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

        if(!this.listening){
            this.listening = true
            this.client.on('interactionCreate', async (interaction) => this.listenMenu(interaction))
        }
       

        return replyRow
    }

    listenMenu = async (i) => {

        if (this.checkIfMainMenu(i.customId))
            return await this.listenMainMenu(i);
        else if (this.checkIfRolesMenu(i.customId))
            return await this.listenRolesMenu(i);
        else if (this.checkIfAddRolesMenu(i.customId))
            return await this.listenAddRolesMenu(i);
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
            return await i.showModal(this.createDetailsModal()).catch(console.error); // Show modal as response
        }
        else if (i.customId == this.bMembersID) { //Open 2 buttons for add and remove members (WIP)
            await i.deferUpdate()
            this.bAddMemberID = i.id + 'bAddMemberID'
            this.bRemoveMemberID = i.id + 'bRemoveMemberID'
            //Create buttons
            let bAddMember = new MessageButton().setStyle(2).setLabel("Details").setCustomId(this.bAddMemberID)
            let bRemoveMember = new MessageButton().setStyle(2).setLabel("Members").setCustomId(this.bRemoveMemberID)
            const membersrow = new MessageActionRow().addComponents([bAddMember, bRemoveMember]);
            return await i.followUp({ content: "Select add or remove member", components: [membersrow] }) //Add bottons as response
        }
        else if (i.customId == this.bRolesID) {  //Groups Embeed
            await i.deferUpdate()
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

            return await i.followUp({ embeds: [rolesEmbed], components: [rolessetupRow], ephemeral: true }) //add rows and roles as response
        } else if (i.customId == this.bTimeID) {
            await i.deferUpdate()
            return await i.followUp({ content: "time WIP", components: [] })
        } else if (i.customId == this.bDeleteID) {
            await i.deferUpdate()
            WsUtils.killWS(this.client, this.ws)
            return await i.followUp({ content: "WS Deleted", components: [] })
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
            await i.deferUpdate().catch(r=>r)
            let descriptionInput = i.fields.getTextInputValue('descriptionInput');
            let corporationInput = i.fields.getTextInputValue('corporationInput');
            let natureInput = i.fields.getTextInputValue('natureInput');
            this.ws.description = descriptionInput != "" ? descriptionInput : this.ws.description
            this.ws.corporation = corporationInput != "" ? corporationInput : this.ws.corporation
            this.ws.nature = natureInput != "" ? natureInput : this.ws.nature
            await this.ws.save().catch(err => console.log(err))
            WsUtils.RefreshRecruitMessage(this.client, this.ws)
            return await i.followUp({ content: "Details updated.", components: [], ephemeral: true })

        }
    }

    //Roles
    checkIfRolesMenu = (id) => {
        let idsToCheck = [this.bAddRoleID, this.bRemoveRoleID, this.bsGroupRemoveMenuID]
        return idsToCheck.includes(id)
    }

    listenRolesMenu = async (i) => {
        if (i.customId == this.bAddRoleID) { //not main menu anymore
            await i.deferUpdate()

            let divideNum = 25

            //get roles
            let rolesStrs = []
            let roleStr = ""
            let roleIds = this.message.guild.roles.cache.filter(role => role.name != "@everyone");

            //roleIds = roleIds.flatMap((x) => [x, x+1]);

            roleIds.map(role => role.id).forEach((role, index) => {
                roleStr += `${index + 1} - <@&${role}>\n`
                if ((index + 1) % divideNum === 0) {
                    rolesStrs.push(roleStr)
                    roleStr = ""
                }
            })

            let addRolesEmbed = new MessageEmbed()
                .setTitle(`Whitestar select roles`)
                .setThumbnail("https://i.imgur.com/fNtJDNz.png")
                .setColor("GREEN")
                .setFooter({ text: `Select if battleship/support and the role you want to add` })
                .addField("Whitestar", `<@&${this.ws.wsrole}>`)

            rolesStrs.forEach((rolestr, i) => {
                addRolesEmbed.addField(`Roles [${i + 1}/${rolesStrs.length}]`, rolestr != "" ? rolestr : "None")
            })

            //create menus
            let menusNeeded = rolesStrs.length

            //battleship/support menu

            let componentsToAdd = []

            this.addBsSpMenuID = i.id + "addBsSpMenuID"
            let addBsSpMenu = new MessageSelectMenu().setCustomId(this.addBsSpMenuID).setPlaceholder('Select battleship/support')
            addBsSpMenu.addOptions([
                {
                    label: "Battleship",
                    value: "Battleship",
                },
                {
                    label: "Support",
                    value: "Support",
                }
            ])
            let groupMenusRow1 = new MessageActionRow()
            groupMenusRow1.addComponents([addBsSpMenu])
            componentsToAdd.push(groupMenusRow1)

            this.addRoleMenuID = []

            //create first
            this.addCurrRoleMenuId = i.id + 0 + "addBsSpMenuID"
            this.addRoleMenuID.push(this.addCurrRoleMenuId)
            let addRoleMenu = new MessageSelectMenu().setCustomId(this.addCurrRoleMenuId).setPlaceholder(`0 - ${divideNum}`)
            //Create menus
            roleIds.map(r => r = r).forEach((role, index) => {
                addRoleMenu.addOptions([
                    {
                        label: `${index + 1} - ${role.name}`,
                        value: role.id,
                    }])

                //roleStr += `${index+1} - <@&${role}>\n`
                if ((index + 1) % divideNum === 0) {
                    //Add to row
                    let groupMenusRow = new MessageActionRow()
                    groupMenusRow.addComponents(addRoleMenu)
                    componentsToAdd.push(groupMenusRow)

                    //Make new
                    this.addCurrRoleMenuId = i.id + ((index + 1) / 24) + "addBsSpMenuID"
                    this.addRoleMenuID.push(this.addCurrRoleMenuId)
                    addRoleMenu = new MessageSelectMenu().setCustomId(this.addCurrRoleMenuId).setPlaceholder(`${((index + 1) / divideNum) * divideNum} - ${((index + 1) / divideNum) + 1 * divideNum} `)

                }
            })
            return await i.editReply({ embeds: [addRolesEmbed], components: componentsToAdd, ephemeral: true })
        } else if (i.customId == this.bRemoveRoleID) {
            await i.deferUpdate()
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
            return await i.editReply({ content: `Select which roles to remove`, embeds: [], components: rows, ephemeral: true })
        }
        else if (i.isSelectMenu()) {
            await i.deferUpdate()
            //Remove roles handling
            if (i.customId == this.bsGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.editReply({ content: `<@&${roleToRemove}> Battleship group removed`, embeds: [], components: [], ephemeral: true })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()
                groupsRoles.bsGroupsRoles = groupsRoles.bsGroupsRoles.filter(m => m != roleToRemove)
                return await groupsRoles.save()
            } else if (i.customId == this.spGroupRemoveMenuID) {
                let roleToRemove = i.values[0]
                await i.editReply({ content: `<@&${roleToRemove}> Support group removed`, embeds: [], components: [], ephemeral: true })
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()
                groupsRoles.spGroupsRoles = groupsRoles.spGroupsRoles.filter(m => m != roleToRemove)
                return await groupsRoles.save()
            }
        }



    }

    // Add roles
    checkIfAddRolesMenu = (id) => {
        let idsToCheck = [this.addBsSpMenuID, this.addRoleMenuID]
        if (this.addRoleMenuID) idsToCheck = [...idsToCheck, ...this.addRoleMenuID]
        return idsToCheck.includes(id)
    }

    listenAddRolesMenu = async (i) => {

        if (i.customId == this.addBsSpMenuID) {
            await i.deferUpdate()
            this.selAddType = i.values[0]
        }
        else if (this.addRoleMenuID && this.addRoleMenuID.includes(i.customId)) {
            await i.deferUpdate()
            this.selAddRole = i.values[0]
        }
        if (i.customId == this.addBsSpMenuID || (this.addRoleMenuID && this.addRoleMenuID.includes(i.customId))) {
            if (this.selAddType && this.selAddRole) {
                let groupsRoles = await WhiteStarRoles.findOne({ Corp: this.ws.Corp, wsrole: this.ws.wsrole }).exec()
                if (this.selAddType == "Battleship") {
                    if (!groupsRoles.bsGroupsRoles.includes(this.selAddRole))
                        groupsRoles.bsGroupsRoles.push(this.selAddRole)
                } else {
                    if (!groupsRoles.spGroupsRoles.includes(this.selAddRole))
                        groupsRoles.spGroupsRoles.push(this.selAddRole)
                }
                await groupsRoles.save()

                await i.editReply({ content: `Rrole <@&${this.selAddRole}> Added as ${this.selAddType}`, embeds: [], components: [], ephemeral: true })
                this.selAddType = null
                this.selAddRole = null
                return
            }
        }


    }
}

