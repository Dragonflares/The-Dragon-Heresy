import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
import { embedColors } from '../../HadesStarPlugin/utils/whiteStarsUtils';
const fetch = require("node-fetch");

export class RollCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'rolldice',
            aliases: ['roll'],
            description: "Returns a dice roll",
            usage: "&roll min max"
        });
    }

    async run(message, args) {
        if (args[0] == null) return message.channel.send("No min defined");
        if (args[1] == null) return message.channel.send("No max defined");
        let min = parseInt(args[0])
        let max = parseInt(args[1])
        if (Number.isNaN(min) || Number.isNaN(max)) return message.channel.send("Not a number");
        var randomnumber = Math.floor(Math.random() * (max - min+1)) + min;
        const embed = new MessageEmbed();
        embed.setTitle("Rolling");
        embed.addField("You rolled: ", randomnumber)
        embed.setThumbnail('https://i.imgur.com/UkIUx07.png')
        embed.setColor("RANDOM");
        message.channel.send(embed);

    }
}