import { WhitestarsCommand } from './WhitestarsCommand';
import WSRewardsData from '../../../../assets/wsrewards.json' assert { type: "json" };
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu} from 'discord.js';

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

        let selectLevel = new MessageSelectMenu()
            .setCustomId('level')
            .setPlaceholder('Red Star Level')

        //let options = []
        for (let i = 3; i < 11; i++) {
            selectLevel.addOptions([
                {
                label: `Level ${i}`,
                value: `${i}`,
                }
            ])
        }

        let selectmemAmm = new MessageSelectMenu()
            .setCustomId('memAmm')
            .setPlaceholder('Members in the Whitestar')

       /* let option5 = new MessageMenuOption()
            .setLabel('5vs5')
            .setValue(5)
        selectmemAmm.addOptions(option5)
        let option10 = new MessageMenuOption()
            .setLabel('10vs10')
            .setValue(10)
        selectmemAmm.addOptions(option10)
        let option15 = new MessageMenuOption()
            .setLabel('15vs15')
            .setValue(15)*/
        selectmemAmm.addOptions([
            {
                label: `5vs5`,
                value: `5`,
            },
            {
                label: `10vs10`,
                value: `10`,
            },
            {
                label: `15vs15`,
                value: `15`,
            },
        ])

        let firstRow = new MessageActionRow()
        firstRow.addComponents(selectLevel)
        let secondRow = new MessageActionRow()
        secondRow.addComponents(selectmemAmm)
        let messageReaction = await message.channel.send({embeds: [embed] , components: [firstRow, secondRow] });


        const filter = (button) => button.user.bot == false;
        const collector = messageReaction.createMessageComponentCollector({filter,  time: 2 * 60 * 1000});
        collector.on('collect', async b => {
            if (b.customId == "level") {
                rsLevel = b.values[0]
            } else if (b.customId == "memAmm") {
                memAmm = b.values[0]
            }
            b.deferUpdate()
            let embed = await this.GetRewardsMessage(rsLevel, memAmm)
            messageReaction.edit({embeds:[embed]})

        });
        collector.on('end', async collected => {
            let msgEmbed = await this.GetRewardsMessage(rsLevel, memAmm)
            msgEmbed.setColor("RED")
            messageReaction.edit({ components: [], embeds: [msgEmbed] });
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
            embed.addField('*RS Level*', rsLevel.toString());
            embed.addField('*Members*', memAmm.toString());
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