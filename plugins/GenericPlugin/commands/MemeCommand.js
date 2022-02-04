import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
const fetch = require("node-fetch");

export class MemeCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'getmeme',
            aliases: ['meme'],
            description: "Returns a random meme.",
            usage: "&meme"
        });
    }

    async run(message, args) {
        const url = `https://meme-api.herokuapp.com/gimme`;

        try {
            this.load(url).then(response => {
                try {
                    const data = JSON.parse(response);
                    if(!data.url.endsWith('.gif')){
                        const embed = new MessageEmbed();
                        embed.addField("Title",data.title)
                        embed.setImage(`${data.url}`);
                        embed.setTitle("Here's a random meme");
                        embed.setColor("RANDOM");
                        message.channel.send(embed);
                    }else{
                        const embed = new MessageEmbed();
                        embed.addField("Title",data.title)
                        embed.addField(`Gif`,`Spoilered to save bandwidth!`);
                        embed.setTitle("Here's a random meme");
                        embed.setColor("RANDOM");
                        message.channel.send(embed);
                        message.channel.send(`|| ${data.url} ||`)
                      ;
                    }
                    
                } catch(err) {
                    message.channel.send("Can't look up memes.");
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