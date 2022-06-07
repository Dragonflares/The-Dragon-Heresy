import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { InfoCommand } from './InfoCommand';

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export class HelpCommand extends InfoCommand{
    constructor(plugin){
        super(plugin, {
            name: 'help',
            aliases: ['h'],
            description: "Returns all commands, or one specific command info",
            usage: "&help <command>"
        });
    }

    async run(message, args){
        if(message.mentions.users > 0) return message.channel.send({text: "You can't tag members for this command."})
        if (args[0])
            return this.getCMD(message, args[0]);
        return this.getAll(message);
    }


    getAll(message) {
        const embed = new MessageEmbed().setColor("RANDOM");


        // Sort commands by category, subcategory, name
        
        const commands = Array.from(this.bot.commands.values()).sort((a,b) => {
            if(a.category != b.category){
                if(a.category < b.category) return -1;
                if(a.category > b.category) return 1;    
            }
            if(a.subcategory != b.subcategory){
                if(a.subcategory < b.subcategory) return -1;
                if(a.subcategory > b.subcategory) return 1;    
            }
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        });
        // Group by category & subcategory
        const categories = new Map();
        commands.forEach(command => {
            if(!command.category){
                logger.warn(`No category defined for [${command.name}]`);
            }
            if(!categories.has(command.category))
                categories.set(command.category, new Map());

            const subCategories = categories.get(command.category);

            if(!subCategories.has(command.subcategory))
                subCategories.set(command.subcategory, new Set());

            subCategories.get(command.subcategory).add(command)
        });

        embed.setTitle(`Rising Imperium Bot Commands`);
        categories.forEach((subCategories, category) => {
            embed.addField(stripIndents`**${capitalize(category)}**`, `${
                Array.from(subCategories).map(([subCategory, commands]) => `${capitalize(subCategory)}\n${
                    Array.from(commands).filter(command=> !command.hidden).map(command => `\`${command.name}\``).join(', ')
                }`).join('\n\n')
            }`)
        });

        embed.setFooter({text: "use &help plus the name of the command for usage information."})
        return message.channel.send({embeds:[embed]});
    }

    getCMD(message, input) {
        const embed = new MessageEmbed()
        const cmd = this.bot.commands.get(input.toLowerCase());
        
        const info = [];
        if (!cmd || cmd.hidden) {
            return message.channel.send({embeds:[embed.setColor("RED").setDescription(`No information found for command **${input.toLowerCase()}**`)]});
        }
        if (cmd.name) info.push(`**Command name**: ${cmd.name}`);
        if (cmd.aliases) info.push(`**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`);
        if (cmd.description) info.push(`**Description**: ${cmd.description}`);
        if (cmd.usage) {
            info.push(`**Usage**: ${cmd.usage}`);
            embed.setFooter({text:`Syntax: <> = required, () = optional`});
        }

        return message.channel.send({embeds:[embed.setColor("GREEN").setDescription(info.join('\n'))]});
    }
}