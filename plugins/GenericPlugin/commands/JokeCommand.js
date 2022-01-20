import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
const fetch = require("node-fetch");

export class JokeCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'getjoke',
            aliases: ['joke'],
            description: "Returns a random joke.",
            usage: "&joke"
        });
    }

    async run(message, args) {
        const url = `https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;

        try {
            this.load(url).then(response => {
                try {
                    const data = JSON.parse(response);
                    const embed = new MessageEmbed();
                    if(data.joke)
                    {
                        embed.addField(`Joke`,`${data.joke}`);
                    }else{
                        embed.addField(`Question`,`${data.setup}`);
                        embed.addField('Answer',`${data.delivery}`)
                    }
                    embed.setTitle("Here's a random joke");
                    embed.setColor("RANDOM");
                    message.channel.send(embed);
                    
                } catch(err) {
                    message.channel.send("Can't look up jokes.");
                }
            }).catch(console.error);
        } catch(err) {
            console.log(err)
            message.channel.send("I'm currently having trouble looking up jokes. Please try again later.");
        }
    }

    async  load(url) {
        let obj = null;
        
        try {
            
            obj = await fetch(url);

        } catch(e) {
            console.log(e);
        }
        return await obj.text();
    }
}