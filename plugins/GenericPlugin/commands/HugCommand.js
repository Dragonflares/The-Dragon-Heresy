import { GenericCommand } from './GenericCommand';
import { MessageEmbed } from 'discord.js';
const fetch = require("node-fetch");

export class HugCommand extends GenericCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'hugging',
            aliases: ['hug'],
            description: "Hug a user.",
            usage: "&hug"
        });
    }

    async run(message, args) {
        const user = message.mentions.users.first()
        if (!user ) {
            message.channel.send("You must ping someone to hug!")
            return;
        }

        let amountOfReplies = 6;
        var randomnumber = Math.floor(Math.random() * (amountOfReplies)) ;
        let stringsArray = [
        `https://www.thecultureconcept.com/wp-content/uploads/2010/06/Hugging-the-Dragon-may-be-more-Helpful.jpg`,
        `https://i.pinimg.com/originals/40/f4/94/40f494153e9e640dd7ea4ae2e310e034.jpg`,
        `http://dragonridersofberk.yolasite.com/resources/hiccup-toothless-how-to-train-your-dragon-11265475-900-814.jpg`,
        `https://preview.redd.it/dkfb6oce2mc51.png?width=640&crop=smart&auto=webp&s=f5b2daf199019214caefd38ac1456dfecae21496`,
        `https://i.redd.it/2n5ehszj1lh41.jpg`,
        `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDLDUOPXMxqndHEFo_F9AOeNsioPmOhktVPQ&usqp=CAU`
    ]

        const embed = new MessageEmbed();
        embed.setTitle("HUGS!");
        embed.addField(`Hug reciever:`, user)
        embed.addField(`You got a hug from:`, message.guild.member(message.author))
        embed.setImage(stringsArray[randomnumber])
        embed.setColor("PURPLE");
        message.channel.send(embed);
    }
}