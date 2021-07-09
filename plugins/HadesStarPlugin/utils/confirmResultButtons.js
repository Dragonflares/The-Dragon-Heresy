import { randomInt } from './randomInt';
import { findBestMatch } from 'string-similarity';
const { MessageButton, MessageActionRow } = require("discord-buttons")

const replies = [
    "Alright, just retry without dyslexia.",
    "Jesus.. try again.",
    "Seriously? Do it again.",
    "lol",
    "Just a little bit more faith in yourself.",
    "I believe you need this \n > https://learnenglish.britishcouncil.org/"
];

export const confirmResultButtons = async (message, query, list) => {
    const rate = findBestMatch(query, list);
    let copyList = list
    if(!copyList.map(value => value.toLowerCase()).includes(query.toLowerCase()))
    {
        rate.ratings.sort((a, b) => b.rating - a.rating)
        let numOptions = rate.ratings.length;
        if (numOptions > 2) numOptions = 3;
        let buttons = []
        let buttonRow = new MessageActionRow()
        for (let i = 0; i < numOptions; i++) {
            buttons[i] = new MessageButton()
                .setStyle('green')
                .setLabel(rate.ratings[i].target)
                .setID(rate.ratings[i].target)
            buttonRow.addComponent(buttons[i]);
        }
        buttons[numOptions] = new MessageButton()
            .setStyle('grey')
            .setLabel('Cancel')
            .setID('Cancel')
        buttonRow.addComponent(buttons[numOptions]);
        let textMsg = `Did you mean?`
        let messageReaction = await message.channel.send(textMsg, { component: buttonRow });

        try {
            const response = await messageReaction.awaitButtons(
                m => m.clicker.user.id === message.author.id, {
                max: 1,
                time: 10000,
                errors: ['time']
            });
            let m = await response.first()

            if (m.id == "Cancel") {
                throw new Error();
            } else {
                messageReaction.edit(`Your choice: ${m.id}`, { component: null })
                m.reply.defer()
                return m.id
            }
        } catch (err) {
            messageReaction.edit(textMsg, { component: null })
            message.channel.send(replies[randomInt(0, replies.length - 1)]);
            return false;
        }

        return;
    }else {
        return query
    }
}