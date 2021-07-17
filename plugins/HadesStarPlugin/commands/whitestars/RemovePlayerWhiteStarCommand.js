import { WhitestarsCommand } from './WhitestarsCommand';
import { Corp, Member, WhiteStar ,RankRoles} from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { MemberDAO, CorpDAO } from '../../../../lib/utils/DatabaseObjects'
import { id } from 'common-tags';
const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")

export class RemovePlayerWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'removeplayerws',
      aliases: ['rmpws','rpws'],
      description: "Removes a player from a White Star.",
      usage: "&rmpws"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      let corp = await CorpDAO.find(message.guild.id)
      if(!corp){
        return message.channel.send("This Corp doesn't exist.")
      }
      let rankcorp = await CorpDAO.populateRanks(corp)
      if (user.roles.cache.find(r=> r == rankcorp.rankRoles.Officer))
        return this.removePlayerWS(message, rankcorp)
      else
        return message.channel.send("You are not an Officer of this Corp!")
    }
  }

  removePlayerWS = async (message, rankcorp) => {
    //Get all WS going
    let wsList = await WhiteStar.find({ Corp: rankcorp._id })
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
              .setLabel(m.name.substring(0,24))
              .setValue(m.name.substring(0,24))
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
        let player = await ws.members.filter(m => m.name.substring(0,24) == name.substring(0,24))[0]
        if (ws.preferences.has(player.discordId)) {
          let remainingMembers = await ws.members.filter(m => m.name.substring(0,24) != name.substring(0,24))
          ws.members = remainingMembers
          ws.preferences.delete(player.discordId)
          ws.leadPreferences.delete(player.discordId)
          let roleMember = await message.guild.members.fetch(player.discordId)
          roleMember.roles.remove(ws.wsrole)
          await ws.save()
          await WsUtils.RefreshRecruitMessage(this.client, ws, null);
          await message.channel.send(`${player.name} removed from ${message.guild.roles.cache.find(r => r.id == ws.wsrole).name} White Star!`)
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


