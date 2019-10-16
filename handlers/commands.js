const { readdirSync } = require("fs");

const ascii = require("ascii-table");

let table = new ascii("Commands");
table.setHeading("Command", "Load status");

module.exports = (client) => {
    readdirSync("./commands/").forEach(dir => {
        readdirSync(`./commands/${dir}/`).forEach(subcat => {
            const commands = readdirSync(`./commands/${dir}/${subcat}/`).filter(file => file.endsWith(".js"));

            for (let file of commands) {
                let pull = require(`../commands/${dir}/${subcat}/${file}`);
    
                if (pull.name) {
                    client.commands.set(pull.name, pull);
                    table.addRow(file, '✅');
                } else {
                    table.addRow(file, `❌  -> missing a help.name, or help.name is not a string.`);
                    continue;
                }
    
                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
            }
        })  
    });

    console.log(table.toString());
} 