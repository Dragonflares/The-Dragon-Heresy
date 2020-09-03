import { randomInt } from './randomInt';

const replies = [
    "Allright, just retry without dyslexia.",
    "Jesus.. try again.",
    "Seriously ? Do it again.",
    "lol",
    "> https://learnenglish.britishcouncil.org/"
];

export const confirmTech = async (message, query, tech) => {
    if(tech.name.toLowerCase() != query.toLowerCase()){
        message.channel.send(`Did you mean *${tech.name}* ?`);
        try {
            const response = await message.channel.awaitMessages(
                m => m.author.id === message.author.id,{
                max: 1,
                time: 10000,
                errors: ['time']
            });

            if(!["y", "yes", "yeah", "yea", "yup", "yep", "ye", "of course", "right", "true"].includes(response.first().content.toLowerCase())){
                throw new Error();
            }
        } catch (err) {
            message.channel.send(replies[randomInt(0, replies.length-1)]);

            return false;
        }
    }
    return true;
}