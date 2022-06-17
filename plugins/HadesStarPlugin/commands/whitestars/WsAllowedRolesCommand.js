import { WhitestarsCommand } from './WhitestarsCommand';
import { Corp } from '../../database';
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } from 'discord.js';

export class WsAllowedRolesCammand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'wsallowedroles',
      aliases: ['wsar', 'n'],
      description: "Ws roles info.",
      usage: "&wsallowedroles"
    });
  }

  async run(message, args) {
    //Get Author
    const members = await message.guild.members.fetch();
    let author
    await members.forEach(member => {
      if (member.id === message.author.id) {
        author = member
      }
    })
    const corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate("rankRoles").exec()
    if (!author.permissions.has("ADMINISTRATOR") && !author.permissions.has("MANAGE_GUILD")) {

      let roles = corp.rankRoles
      let AuthorRoles = author.roles.cache.map(role => role.id)

      if (!AuthorRoles.includes(roles.Officer) && !AuthorRoles.includes(roles.FirstOfficer)) {
        this.startWsAllowedRolesMessage(message, args, corp, false)
      } else {
        this.startWsAllowedRolesMessage(message, args, corp, true)
      }
    } else {
      this.startWsAllowedRolesMessage(message, args, corp, true)
    }
  }

  makeEmbedMessage = async (message, corp) => {
    let rolesEmbed = new MessageEmbed()
      .setTitle(`${corp.name} whitestar allowed roles`)
      .setColor("GREEN")
      .setFooter({ text: `These are the roles allowed to use to open and manage whitestars in this corp.` })

    let messageString = "";

    let printRoles = corp.wsAllowedRoles
    if (printRoles) {
      for (let i = 0; i < printRoles.length; i++) {
        messageString += `<@&${printRoles[i]}>\n`
      }
    }
    if (messageString == "") messageString = "None"

    rolesEmbed.addField("Roles:", messageString)
    return rolesEmbed
  }

  startWsAllowedRolesMessage = async (message, args, corp, officer) => {
    message.delete({ timeout: 1 });    //Delete User message

    this.bAddId = message.id + "add"
    this.bDelId = message.id + "del"
    let bAddRole = new MessageButton().setStyle(3).setLabel("Add").setCustomId(this.bAddId)
    let bRemoveRole = new MessageButton().setStyle(4).setLabel("Remove").setCustomId(this.bDelId)
    const rolessetupRow = new MessageActionRow().addComponents([bAddRole, bRemoveRole]);

    let embed = await this.makeEmbedMessage(message, corp)
    let messageReact
    if (officer)
      messageReact = await message.channel.send({ embeds: [embed], components: [rolessetupRow] })
    else
      messageReact = await message.channel.send({ embeds: [embed] })

    const filter = (button) => button.user.bot == false;
    const collector = messageReact.createMessageComponentCollector({ filter, time: 2 * 60 * 1000 });

    collector.on('collect', async b => {

      if (b.user.id == message.author.id) {

        if (b.customId == this.bAddId) {
          await b.deferUpdate()
          let divideNum = 25

          //get roles
          let rolesStrs = []
          let roleStr = ""
          await messageReact.guild.roles.fetch()
          let roleIds = await messageReact.guild.roles.cache.filter(role => role.name != "@everyone");
          //roleIds = roleIds.flatMap((x) => [x, x+1]);
          let printRoles = corp.wsAllowedRoles
          roleIds = roleIds.filter(role => !printRoles.includes(role))
          //Add filters on already added roles

          roleIds.map(role => role.id).forEach((role, index) => {
            roleStr += `${index + 1} - <@&${role}>\n`
            if ((index + 1) % divideNum === 0) {
              rolesStrs.push(roleStr)
              roleStr = ""
            }
          })
          if (roleStr != "")
            rolesStrs.push(roleStr)

          let addRolesEmbed = new MessageEmbed()
            .setTitle(`Whitestar allowed roles`)
            .setThumbnail("https://i.imgur.com/fNtJDNz.png")
            .setColor("GREEN")
            .setFooter({ text: `Select the role you want to add` })

          rolesStrs.forEach((rolestr, i) => {
            addRolesEmbed.addField(`Roles [${i + 1}/${rolesStrs.length}]`, rolestr != "" ? rolestr : "None")
          })

          //create menus
          let menusNeeded = rolesStrs.length
          let componentsToAdd = []
          this.addRoleMenuID = []

          //create first
          this.addCurrRoleMenuId = b.id + 0 + "addWsRoleID"
          this.addRoleMenuID.push(this.addCurrRoleMenuId)
          let addRoleMenu = new MessageSelectMenu().setCustomId(this.addCurrRoleMenuId).setPlaceholder(`Page 1`)
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
              this.addCurrRoleMenuId = b.id + ((index + 1) / divideNum) + "addWsRoleID"
              this.addRoleMenuID.push(this.addCurrRoleMenuId)
              addRoleMenu = new MessageSelectMenu().setCustomId(this.addCurrRoleMenuId).setPlaceholder(`Page ${this.addRoleMenuID.length} `)

            }
          })

          if (addRoleMenu.options.length > 0) {
            let groupMenusRow = new MessageActionRow()
            groupMenusRow.addComponents(addRoleMenu)
            componentsToAdd.push(groupMenusRow)
          }

          return await b.followUp({ embeds: [addRolesEmbed], components: componentsToAdd, ephemeral: true })
        } else if (b.customId == this.bDelId) {
          await b.deferUpdate()
          let printRoles = corp.wsAllowedRoles
          if (printRoles) {
            if (printRoles.length == 0) {
              return await b.followUp({ content: 'No roles to delete.', ephemeral: true })
            }
            //create menus
            let menusNeeded = printRoles.length
            let componentsToAdd = []
            this.delRoleMenuID = []
            let divideNum = 25

            //create first
            this.delCurrRoleMenuId = b.id + 0 + "delWsRoleID"
            this.delRoleMenuID.push(this.delCurrRoleMenuId)
            let delRoleMenu = new MessageSelectMenu().setCustomId(this.delCurrRoleMenuId).setPlaceholder(`Roles`)

            let rolesNId = new Map()
            await messageReact.guild.roles.fetch()
            await printRoles.forEach(async (role) => {
              let name = await messageReact.guild.roles.cache.get(role).name
              rolesNId.set(role, name)
            })

            //Create menus
            await printRoles.forEach(async (role, index) => {
              delRoleMenu.addOptions([
                {
                  label: rolesNId.get(role),
                  value: role,
                }])
              //roleStr += `${index+1} - <@&${role}>\n`
              if ((index + 1) % divideNum === 0) {
                //Add to row
                let groupMenusRow = new MessageActionRow()
                groupMenusRow.addComponents(delRoleMenu)
                componentsToAdd.push(groupMenusRow)

                //Make new
                this.delCurrRoleMenuId = b.id + ((index + 1) / divideNum) + "delWsRoleID"
                this.delRoleMenuID.push(this.delCurrRoleMenuId)
                delRoleMenu = new MessageSelectMenu().setCustomId(this.delCurrRoleMenuId).setPlaceholder(`${((index + 1) / divideNum) * divideNum + 1} - ${((index + 1) / divideNum) + 1 * divideNum} `)

              }
            })


            if (delRoleMenu.options.length > 0) {
              let groupMenusRow = new MessageActionRow()
              groupMenusRow.addComponents(delRoleMenu)
              componentsToAdd.push(groupMenusRow)
            }
            return await b.followUp({ content: "Select a role you wish to delete", components: componentsToAdd, ephemeral: true })

          }

          return await b.followUp({ content: 'No roles to delete.', ephemeral: true })
        }
      }
    })

    this.client.on('interactionCreate', async (interaction) => {
      if (this.addRoleMenuID && this.addRoleMenuID.includes(interaction.customId)) {
        await interaction.deferUpdate().catch();
        corp.wsAllowedRoles.push(interaction.values[0])
        await corp.save()
        await interaction.editReply({ content: `Rank <@&${interaction.values[0]}> added.`, embeds: [], components: [], ephemeral: true })
        let embed = await this.makeEmbedMessage(message, corp)
        return await messageReact.edit({ embeds: [embed] })
      } else
        if (this.delRoleMenuID && this.delRoleMenuID.includes(interaction.customId)) {
          await interaction.deferUpdate().catch();
          corp.wsAllowedRoles = corp.wsAllowedRoles.filter(role => role != interaction.values[0])
          await corp.save()
          await interaction.editReply({ content: `Rank <@&${interaction.values[0]}> removed.`, embeds: [], components: [], ephemeral: true })
          let embed = await this.makeEmbedMessage(message, corp)
          return await messageReact.edit({ embeds: [embed] })
        }
    })

    collector.on('end', async collected => {
      let newEmbed = new MessageEmbed(messageReact.embeds[0])
      newEmbed.setColor("RED")
      messageReact.edit({ components: [], embeds: [newEmbed] })
    });
  }


}


