import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export class XKCDCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'getxkcd',
            aliases: ['xkcd'],
            description: "Returns an xkcd comic.",
            usage: "&xkcd"
        });
    }

    async run(message, args) {
        const url = `https://xkcd.com/info.0.json`;

        try {
            this.load(url).then(response => {
                try {
                    const data = JSON.parse(response);
                    const rand = Math.floor(Math.random() * Math.floor(data.num))
                    const url = `http://xkcd.com/${rand}/info.0.json`;
                    this.load(url).then(response1 => {
                        const data1 = JSON.parse(response1);
                        const embed = new MessageEmbed();
                        embed.addField(`Title`, `${data1.alt}`);
                        embed.setImage(`${data1.img}`)
                        embed.setTitle("Here's a random XKCD");
                        embed.setColor("RANDOM");
                        message.channel.send({ embeds: [embed] });
                    })

                } catch (err) {
                    message.channel.send("Can't look up xkcd comics.");
                }
            }).catch(console.error);
        } catch (err) {
            console.log(err)
            message.channel.send("I'm currently having trouble looking up xkcd comics. Please try again later.");
        }
    }

    async load(url) {
        let obj = null;
        try {
            obj = await fetch(url);
        } catch (e) {
            console.log(e);
        }
        return await obj.text();
    }
}