import { WhitestarsCommand } from './WhitestarsCommand';
import { Corp, Member, WhiteStar ,RankRoles} from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { id } from 'common-tags';
const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")

export class RemovePlayerWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'removeplayerws',
      aliases: ['rmpws'],
      description: "Removes a player to a White Star.",
      usage: "&rmpws"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('rankRoles').exec();
      if (user.roles.cache.find(r=> r == corp.rankRoles.Officer))
        return this.removePlayerWS(message, member)
      else
        return message.channel.send("You are not an Officer!")
    }
  }

  removePlayerWS = async (message, member) => {
    //Get all WS going
    let wsList = await WhiteStar.find({ Corp: member.Corp })
    let wsRolesList = []
    wsList.forEach(ws => {
      wsRolesList.push(message.guild.roles.cache.find(r => r.id == ws.wsrole).name)
    })

    let selectLevel = new MessageMenu()
      .setID('group')
      .setPlaceholder('Select Whitestar Group')
      .setMaxValues(1)
      .setMinValues(1)

    let options = []
    wsRolesList.forEach(groupname => {
      let optionstemp = new MessageMenuOption()
        .setLabel(groupname)
        .setValue(groupname)
      selectLevel.addOption(optionstemp)
    });

    let firstRow = new MessageActionRow()
    let secondRow = new MessageActionRow()
    firstRow.addComponent(selectLevel)

    let messageReaction = await message.channel.send(`Select WS and User!`, firstRow)
    const filter = (button) => button.clicker.user.bot == false;

    const collector = messageReaction.createMenuCollector(filter, { time: 2 * 60 * 1000, dispose: true });
    const collectorBtn = messageReaction.createButtonCollector(filter, { time: 2 * 60 * 1000, dispose: true });
    let ws
    let name
    collector.on('collect', async b => {

      if (b.id == "group") {
        ws = await WhiteStar.findOne({ wsrole: message.guild.roles.cache.find(r => r.name == b.values[0]).id }).populate('author').populate('members').exec()
        if (ws) {
          let selectMember = new MessageMenu()
            .setID('member')
            .setPlaceholder('Select Member')
            .setMaxValues(1)
            .setMinValues(1)
          ws.members.forEach(m => {
            let optionmem = new MessageMenuOption()
              .setLabel(m.name)
              .setValue(m.name)
            selectMember.addOption(optionmem)
          });

          secondRow.addComponent(selectMember)
          messageReaction.edit({ components: [firstRow, secondRow] })
        }
      }
      if (b.id == "member") {
        name = b.values[0]
        let acceptButton = new MessageButton()
          .setStyle('red')
          .setLabel('Accept')
          .setID('Accept')

        let cancelButton = new MessageButton()
          .setStyle('grey')
          .setLabel('Cancel')
          .setID('Cancel')
        let buttonRow = new MessageActionRow()
        buttonRow.addComponent(acceptButton);
        buttonRow.addComponent(cancelButton);
        messageReaction.edit({ components: [firstRow, secondRow, buttonRow] })
      }
      b.reply.defer()
    });

    collectorBtn.on('collect', async b => {
      b.reply.defer()
      if (b.id == "Accept") {
        let player = await ws.members.filter(m => m.name == name)[0]
        if (ws.preferences.has(player.discordId)) {
          let remainingMembers = await ws.members.filter(m => m.name != name)
          ws.members = remainingMembers
          ws.preferences.delete(player.discordId)
          ws.leadPreferences.delete(player.discordId)
          let roleMember = await message.guild.members.fetch(player.discordId)
          roleMember.roles.remove(ws.wsrole)
          await ws.save()
          await WsUtils.RefreshRecruitMessage(this.client, ws, null);
          await message.channel.send(`${player.name} removed from <@&${ws.wsrole}> White Star!`)
        }
      }

      if (b.id == "Accept" || b.id == "Cancel") {
        messageReaction.delete({ timeout: 1 });
      }
    })

    collector.on('end', async collected => {
      messageReaction.delete({ timeout: 1 });
    });
  }
}


