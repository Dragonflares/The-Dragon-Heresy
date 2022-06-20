import { WhitestarsCommand } from './WhitestarsCommand';
import { Corp, Member, WhiteStar ,RankRoles} from '../../database';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { MemberDAO, CorpDAO } from '../../../../lib/utils/DatabaseObjects'
import pkg from 'common-tags';
const { id } = pkg;
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu} from 'discord.js';

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
    let user = message.author
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('rankRoles').exec();
      if(!corp){
        return message.channel.send("This Corp doesn't exist.")
      }
      let rankcorp = await CorpDAO.populateRanks(corp)
      let memberCheck = message.guild.members.cache.get(message.author.id)
      if (memberCheck.roles.cache.some(role => role.id == corp.rankRoles.Officer))
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

    let selectLevel = new MessageSelectMenu()
      .setCustomId('group')
      .setPlaceholder('Select Whitestar Group')

    wsRolesList.forEach(groupname => {
      selectLevel.addOptions([
        {
        label: groupname,
        value: groupname,
        }
      ])
    });

    let firstRow = new MessageActionRow()
    let secondRow = new MessageActionRow()
    firstRow.addComponents(selectLevel)

    let messageReaction = await message.channel.send({content: `Select WS and User to remove!`,components: [firstRow]})
    const filter = (button) => button.user.bot == false;

    const collector = messageReaction.createMessageComponentCollector({filter,  time: 2 * 60 * 1000});
    let ws
    let name
    collector.on('collect', async b => {

      if (b.customId == "group") {
        ws = await WhiteStar.findOne({ wsrole: message.guild.roles.cache.find(r => r.name == b.values[0]).id }).populate('author').populate('members').populate('groupsRoles').exec()
        if (ws && ws.members.length >0) {
          let selectMember = new MessageSelectMenu()
            .setCustomId('member')
            .setPlaceholder('Select Member')
          ws.members.forEach(m => {
            selectMember.addOptions([
              {
                label: m.name.substring(0,24),
                value: m.name.substring(0,24),
              }
            ])
          });

          secondRow.addComponents(selectMember)
          messageReaction.edit({ components: [secondRow] })
        }
      }
      if (b.customId == "member") {
        name = b.values[0]
        let acceptButton = new MessageButton()
          .setStyle(3)
          .setLabel('Accept')
          .setCustomId('Accept')

        let cancelButton = new MessageButton()
          .setStyle(2)
          .setLabel('Cancel')
          .setCustomId('Cancel')
        let buttonRow = new MessageActionRow()
        buttonRow.addComponents(acceptButton);
        buttonRow.addComponents(cancelButton);
        messageReaction.edit({content: `Remove ${name} from  ${message.guild.roles.cache.find(r => r.id == ws.wsrole).name} White Star?`, components: [ buttonRow] })
      }
      if (b.customId == "Accept") {
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
          await messageReaction.edit({content: `${player.name} removed from ${message.guild.roles.cache.find(r => r.id == ws.wsrole).name} White Star!`, components: []})
        }
      }

      if (b.customId == "Cancel") {
        await messageReaction.edit({content:`Remove WS player canceled`, components: []})
      }
      b.deferUpdate()
    });

    collector.on('end', async collected => {
      await messageReaction.edit({content:`Remove WS player timedout!`, components: []})
     
    });
  }
}


