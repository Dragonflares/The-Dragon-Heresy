import { randomInt } from './randomInt';
import { findBestMatch } from 'string-similarity';
import { GuildAuditLogsEntry } from 'discord.js';
const { MessageButton, MessageActionRow } = require("discord-buttons")

const replies = [
    "Allright, just retry without dyslexia.",
    "Jesus.. try again.",
    "Seriously ? Do it again.",
    "lol",
    "> https://learnenglish.britishcouncil.org/"
];

export const confirmTech = async (message, query, tech) => {
    if (tech.name.toLowerCase() != query.toLowerCase()) {

        let yesButton = new MessageButton()
            .setStyle('green')
            .setLabel('Yes')
            .setID('yes')

        let noButton = new MessageButton()
            .setStyle('red')
            .setLabel('No')
            .setID('no')
        let buttonRow = new MessageActionRow()
            .addComponent(yesButton)
            .addComponent(noButton)
        let textMsg = `Did you mean *${tech.name}* ?`
        let messageReaction = await message.channel.send(textMsg, { component: buttonRow });

        try {
            const response = await messageReaction.awaitButtons(
                m => m.clicker.user.id === message.author.id, {
                max: 1,
                time: 10000,
                errors: ['time']
            });
            let m = await response.first()
            if (m.id == "yes") {
                messageReaction.edit(textMsg, { component: null })
                m.defer()
                return true
            }
            else if (m.id == "no") {
                throw new Error();
            }
            return true;
        } catch (err) {
            messageReaction.edit(textMsg, { component: null })
            message.channel.send(replies[randomInt(0, replies.length - 1)]);
            return false;
        }
    }
    return true;
}