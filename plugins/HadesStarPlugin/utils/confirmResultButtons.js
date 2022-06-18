import { randomInt } from './randomInt';
import { findBestMatch } from 'string-similarity';
import {MessageActionRow, MessageButton } from 'discord.js';

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
                .setStyle('SUCCESS')
                .setLabel(rate.ratings[i].target)
                .setCustomId(rate.ratings[i].target)
            buttonRow.addComponents(buttons[i]);
        }
        buttons[numOptions] = new MessageButton()
            .setStyle(4)
            .setLabel('Cancel')
            .setCustomId('Cancel')
        buttonRow.addComponents(buttons[numOptions]);
        let textMsg = `Did you mean?`

        let messageReaction = await message.channel.send({content: textMsg, components: [buttonRow]});
        const filter = i =>  i.user.id === message.author.id;

        try {
            const i = await messageReaction.channel.awaitMessageComponent({ filter, time: 15000 }).catch();
            if (i.customId == "Cancel") {
                throw new Error();
            } else {
                messageReaction.edit({content: `Your choice: ${i.customId}`,  components: []})
                return i.customId 
            }
        } catch (err) {
            messageReaction.edit({textMsg,  components: [] })
            message.channel.send(replies[randomInt(0, replies.length - 1)]);
            return false;
        }
          
    }else {
        return rate.bestMatch.target
    }
    
}