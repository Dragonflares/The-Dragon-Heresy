import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export class FactCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'getfact',
            aliases: ['fact'],
            description: "Returns a random fact.",
            usage: "&fact"
        });
    }

    async run(message, args) {
        const url = `https://uselessfacts.jsph.pl/random.json?language=en`;

        try {
            this.load(url).then(response => {
                try {
                    const data = JSON.parse(response);
                    const embed = new MessageEmbed();
                    embed.setDescription(`${data.text}`);
                    embed.setTitle("Here's a useless fact...");
                    embed.setColor("RANDOM");
                    message.channel.send({ embeds: [embed] });
                } catch (err) {
                    message.channel.send("Can't look up facts.");
                }
            }).catch(console.error);
        } catch (err) {
            console.log(err)
            message.channel.send("I'm currently having trouble looking up facts. Please try again later.");
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