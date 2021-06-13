import { randomInt } from './randomInt';
import { findBestMatch } from 'string-similarity';

const replies = [
    "Alright, just retry without dyslexia.",
    "Jesus.. try again.",
    "Seriously? Do it again.",
    "lol",
    "Just a little bit more faith in yourself.",
    "I believe you need this \n > https://learnenglish.britishcouncil.org/"
];

export const confirmResult = async (message, query, result) => {
    if (result.toLowerCase() != query.toLowerCase()) {
        message.channel.send(`Did you mean *${result}* ?`);
        try {
            const response = await message.channel.awaitMessages(
                m => m.author.id === message.author.id, {
                max: 1,
                time: 10000,
                errors: ['time']
            });
            const possitiveList = ["y", "yes", "yeah", "yea", "yup", "yep", "ye", "sure", "absolutely", "of course", "right", "true"]
            const rate = findBestMatch(response.first().content.toLowerCase(), Array.from(possitiveList));
            if (rate.bestMatch.rating < 0.5 && !possitiveList.some(v => response.first().content.toLowerCase().includes(v))) {
                throw new Error();
            }
        } catch (err) {
            message.channel.send(replies[randomInt(0, replies.length - 1)]);

            return false;
        }
    }
    return true;
}