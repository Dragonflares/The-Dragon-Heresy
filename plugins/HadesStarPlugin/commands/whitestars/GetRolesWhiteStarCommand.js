import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, WhiteStarRoles } from '../../database';
import { confirmResultButtons } from '../../utils';
import { MessageEmbed } from 'discord.js';

export class GetRolesWhiteStarCommand extends WhitestarsCommand {
  constructor(plugin) {
    super(plugin, {
      name: 'getrolesws',
      aliases: ['grolesws'],
      description: "Get Ws Roles.",
      usage: "&grolesws wsrole"
    });
  }

  async run(message, args) {
    let user = message.author
    let roles = message.mentions.roles.first()
    let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
    if (!member)
      return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
    else {
      if (!roles) {
        let allRoles = message.guild.roles.cache.map(a => a.name)
        allRoles = allRoles.filter(function (item) {
          return item !== "@everyone"
        })

        let roleName = await confirmResultButtons(message, args.join(' '), allRoles)
        if (!roleName) return;
        roles = message.guild.roles.cache.find(r => r.name === roleName);
      }
      return this.rolesMessage(message, roles, member)
    }
  }
  async rolesMessage(message, role, member) {
    //Delete message
    message.delete({ timeout: 1 });

    //Get ws
    const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate('groupsRoles').exec()

    let rolesEmbed = new MessageEmbed()
      .setTitle(`Whitestar ships roles`)
      .setThumbnail("https://i.imgur.com/fNtJDNz.png")
      .setColor("GREEN")
      .setFooter({ text: `This are the roles that get checked for ws status.` })
      .addField("Whitestar", `<@&${role.id}>`)
    let bsString = "";

    ws.groupsRoles.bsGroupsRoles.forEach(role => {
      bsString += `<@&${role}>\n`
    })

    if (bsString == "") bsString = "None";
    rolesEmbed.addField("Battle Ships:", bsString)

    let spString = "";

    ws.groupsRoles.spGroupsRoles.forEach(role => {
      spString += `<@&${role}>\n`
    })


    if (spString == "") spString = "None";
    rolesEmbed.addField("Support Ships:", spString)

    return message.channel.send({ embeds: [rolesEmbed] })

  }
}