import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp } from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { MemberDAO, CorpDAO } from '../../../../lib/utils/DatabaseObjects'
const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")


export class AddPlayerWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'addplayerws',
      aliases: ['apws'],
      description: "Adds a player to a White Star.",
      usage: "&apws"
    });
  }

  async run(message, args) {
    let user = message.guild.member(message.author)
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      let corp = await CorpDAO.find(message.guild.id)
      if (!corp) {
        return message.channel.send("This Corp doesn't exist.")
      }
      let rankcorp = await CorpDAO.populateRanks(corp)
      if (user.roles.cache.find(r => r == rankcorp.rankRoles.Officer))
        return this.addPlayerWS(message, rankcorp)
      else
        return message.channel.send("You are not an Officer of this Corp!")
    }

  }

  addPlayerWS = async (message, rankcorp) => {
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

    wsRolesList.forEach(groupname => {
      let optionstemp = new MessageMenuOption()
        .setLabel(groupname)
        .setValue(groupname)
      selectLevel.addOption(optionstemp)
    });

    let firstRow = new MessageActionRow()
    let secondRow = new MessageActionRow()
    firstRow.addComponent(selectLevel)

    let messageReaction = await message.channel.send(`Select WS and User to add!`, firstRow)
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

          let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();

          //find tech ID
          const members = Array.from(corp.members)
          const wsmembers = Array.from(ws.members)
          console.log(wsmembers)
          members.forEach(m => {
            let check = wsmembers.some(n => {
              return m.discordId == n.discordId
            })
            if (!check) {
              let optionmem = new MessageMenuOption()
                .setLabel(m.name.substring(0, 24))
                .setValue(m.name.substring(0, 24))
              selectMember.addOption(optionmem)
            }
          });

          secondRow.addComponent(selectMember)
          messageReaction.edit({ components: [secondRow] })
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
        messageReaction.edit(`Add ${name} from  ${message.guild.roles.cache.find(r => r.id == ws.wsrole).name} White Star?`, { components: [buttonRow] })
      }
      b.reply.defer()
    });

    collectorBtn.on('collect', async b => {
      b.reply.defer()
      if (b.id == "Accept") {
        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
        const members = Array.from(corp.members)
        let player = await members.filter(m => m.name.substring(0, 24) == name.substring(0, 24))[0]
        if (!ws.preferences.has(player.discordId)) {
          ws.members.push(player)
          ws.preferences.set(player.discordId, `❓`)
          let roleMember = await message.guild.members.fetch(player.discordId)
          roleMember.roles.add(ws.wsrole)
          await ws.save()
          await WsUtils.RefreshRecruitMessage(this.client, ws, null);

          await message.channel.send(`${player.name} added to ${message.guild.roles.cache.find(r => r.id == ws.wsrole).name} White Star!`)
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


