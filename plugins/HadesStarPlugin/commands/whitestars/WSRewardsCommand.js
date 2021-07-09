import { WhitestarsCommand } from './WhitestarsCommand';
import WSRewardsData from '../../../../assets/wsrewards.json';
import { MessageEmbed } from 'discord.js';
const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")

export class WSRewardsCommand extends WhitestarsCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'wsrewards',
            aliases: ['whitestarrewards'],
            description: "Get Rewards List.",
            usage: "&wsrewards"
        });
    }

    async run(message, args) {
        return this.getWhiteStarRewards(message)
    }

    getWhiteStarRewards = async (message) => {
        let rsLevel = 0
        let memAmm = 5
        let embed = await this.GetRewardsMessage(rsLevel, memAmm)

        let selectLevel = new MessageMenu()
            .setID('level')
            .setPlaceholder('Red Star Level')
            .setMaxValues(1)
            .setMinValues(1)

        let options = []
        for (let i = 3; i < 11; i++) {
            options[i - 3] = new MessageMenuOption()
                .setLabel(`Level ${i}`)
                .setValue(i)
            selectLevel.addOption(options[i - 3])
        }

        let selectmemAmm = new MessageMenu()
            .setID('memAmm')
            .setPlaceholder('Members in the Whitestar')
            .setMaxValues(1)
            .setMinValues(1)

        let option5 = new MessageMenuOption()
            .setLabel('5vs5')
            .setValue(5)
        selectmemAmm.addOption(option5)
        let option10 = new MessageMenuOption()
            .setLabel('10vs10')
            .setValue(10)
        selectmemAmm.addOption(option10)
        let option15 = new MessageMenuOption()
            .setLabel('15vs15')
            .setValue(15)
        selectmemAmm.addOption(option15)

        let firstRow = new MessageActionRow()
        firstRow.addComponent(selectLevel)
        let secondRow = new MessageActionRow()
        secondRow.addComponent(selectmemAmm)
        let messageReaction = await message.channel.send(embed, { components: [firstRow, secondRow] });


        const filter = (button) => button.clicker.user.bot == false;
        const collector = messageReaction.createMenuCollector(filter, { time: 2 * 60 * 1000, dispose: true });
        collector.on('collect', async b => {
            if (b.id == "level") {
                rsLevel = b.values[0]
            } else if (b.id == "memAmm") {
                memAmm = b.values[0]
            }
            //console.log(b)
            b.reply.defer()
            let embed = await this.GetRewardsMessage(rsLevel, memAmm)
            messageReaction.edit(embed)

        });
        collector.on('end', async collected => {
            let msgEmbed = await this.GetRewardsMessage(rsLevel, memAmm)
            messageReaction.edit({ component: null, embed: msgEmbed });
        });
    }
    async GetRewardsMessage(rsLevel, memAmm) {

        let embed = new MessageEmbed().setColor("RANDOM")
        embed.setTitle(`**WS Rewards**`);
        embed.setThumbnail("https://i.imgur.com/fNtJDNz.png")
        embed.setDescription("Whitestar credits and hydro rewards.")
        if (rsLevel > 0) {
            let filteredData = WSRewardsData[rsLevel].map(t => [t, t.Members])
            .filter(([key, value]) => value == memAmm)
            embed.addField('*RS Level*', rsLevel);
            embed.addField('*Members*', memAmm);
            Array.from(filteredData).forEach(element => {
                embed.addField(`__Bars: ${element[0].Bars}/3__`,
                    `Win Credits: ${Math.round(element[0].WinCredits)}\n` +
                    `Win Hydro: ${Math.round(element[0].WinHydro)}\n` +
                    `Loss Credits: ${Math.round(element[0].LossCredits)}\n` +
                    `Loss Hydro: ${Math.round(element[0].LossHydro)}\n` +
                    `Draw Credits: ${Math.round(element[0].DrawCredits)}\n` +
                    `Draw Hydro: ${Math.round(element[0].DrawHydro)}\n`, true)
            })
        }
        return embed
    }
}