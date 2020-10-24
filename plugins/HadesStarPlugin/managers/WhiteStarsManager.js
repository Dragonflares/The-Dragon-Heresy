import { Manager } from '../../../lib';
import { Member, WhiteStar, Corp } from '../database';
const Discord = require('discord.js');

export class WhiteStarsManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.cacher();
            this.client.on('messageReactionAdd', async (messageReaction, user) => this.reactListener(messageReaction, user))
        }
        super.enable();
    }

    cacher = async () => {
        this.client.guilds.cache.forEach(async t => {
            const whiteStars = await WhiteStar.find({}).populate('Corp').exec();
            whiteStars.forEach(async ws => {
                this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
            })
        })
    }

    reactListener = async (messageReaction, user) => {
        if (user.bot) return;

        const reactions = ['⚔️', '🛡️', '🗡️', '❓', '❌', '🚮']


        const ws = await WhiteStar.findOne({ recruitmessage: messageReaction.message.id }).populate('author').populate('members').exec();
        if (ws) {
            let member = await Member.findOne({ discordId: user.id.toString() }).exec();
            messageReaction.users.remove(user); // Remove it
            if (messageReaction.emoji.name == '❌') //Delist
            {
                let remainingMembers = ws.members.filter(m => m.discordId != member.discordId)
                ws.members = remainingMembers
                ws.preferences.delete(member.discordId)
            } else if (messageReaction.emoji.name == '🚮') {
                if (user.id == ws.author.discordId)
                {
                    ws.remove();
                    let msg = await this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
                    msg.delete({ timeout: 1 })
                }
            } else if (reactions.includes(messageReaction.emoji.name)) {
                if (!ws.members.some(e => e.discordId === member.discordId))
                    ws.members.push(member)
                ws.preferences.set(member.discordId, messageReaction.emoji.name)
            }
            ws.save()

            //Update Embed
            //Get Members
            let testString = ""
            ws.members.forEach(t => testString += `${t.name} ${ws.preferences.get(t.discordId)}\n`)
            if (testString == "") testString = "None";

            //Make Message
            let rolesEmbed = new Discord.MessageEmbed()
                .setTitle(`White Star Recruitment by ${ws.author.name}:`)
                .setThumbnail("https://i.imgur.com/fNtJDNz.png")
                .setDescription(`${ws.description}`)
                .addField("Group:", `<@&${ws.wsrole}>`)
                .addField("Current People", Object.keys(ws.members).length)
                .addField("Members", testString)
                .setColor("ORANGE")
                .setFooter(`⚔️ - Attack 🛡️ - Guardian 🗡️ - Assassin ❓ - Doesnt matter ❌ - Delist`)

            let msg = await this.client.channels.cache.get(ws.retruitchannel).messages.fetch(ws.recruitmessage.toString());
            msg.edit(rolesEmbed) // Send Edit
        }
    }

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}