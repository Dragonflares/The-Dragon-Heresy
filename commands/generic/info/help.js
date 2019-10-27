const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require("fs")

module.exports = {
    name: "help",
    aliases: ["h"],
    category: "generic",
    subcategory: "info",
    description: "Returns all commands, or one specific command info",
    usage: "[command | alias]",
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            return getAll(client, message);
        }
    }
}

function getAll(client, message) {
    const embed = new RichEmbed()
        .setColor("RANDOM")

    const subcatcommands = (cat) => {
        const subcategories = fs.readdirSync(`./commands/${cat}/`)
            return subcategories
                .map(subcat => stripIndents`  ${subcat[0].toUpperCase() + subcat.slice(1)} \n${commands(cat,subcat)}`)
                .reduce((string, subcategory) => string + "\n" + subcategory);
    }

    const commands = (category, subcategory) => {
        return client.commands
            .filter(cmd => cmd.category === category && subcategory === cmd.subcategory)
            .map(cmd => `\`${cmd.name} \``)
    }
    for(let category of client.categories) {
        embed.setTitle(`Dragonflares Bot commands`)
        embed.addField(stripIndents`**${category[0].toUpperCase() + category.slice(1)}**`, `${subcatcommands(category)}`)
    }
    embed.setFooter("use &help plus the name of the command for usage information.")
    return message.channel.send(embed);
}

function getCMD(client, message, input) {
    const embed = new RichEmbed()
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
    
    let info = `No information found for command **${input.toLowerCase()}**`;
    if (!cmd) {
        return message.channel.send(embed.setColor("RED").setDescription(info));
    }
    if (cmd.name) info = `**Command name**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Description**: ${cmd.description}`;
    if (cmd.usage) {
        info += `\n**Usage**: ${cmd.usage}`;
        embed.setFooter(`Syntax: <> = required, () = optional`);
    }

    return message.channel.send(embed.setColor("GREEN").setDescription(info));
}