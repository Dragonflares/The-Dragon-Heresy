import { Corp } from '../database'
import { MessageActionRow, MessageSelectMenu } from 'discord.js';

export const collectorFunc = async (client, messageReaction) => {

    // Create button collector for the message
    const filter = (button) => button.user.bot == false;
    const collector = messageReaction.createMessageComponentCollector(filter);

    // Listen to buttons
    collector.on('collect', async b => {
        const corp = await Corp.findOne({ corpId: messageReaction.guild.id.toString() }).populate("redStarRoles").exec()
        //get user
        const members = await messageReaction.guild.members.fetch();
        let author
        await members.forEach(member => {
            if (member.id === b.user.id) {
                author = member
            }
        })

        //Create Menu    
        let selectRsLevel = new MessageSelectMenu()
            .setCustomId('setRslevel')
            .setPlaceholder('Redstar Level')
            .setMinValues(0)


        //Add roles
        let AuthorRoles = author.roles.cache.map(role => role.id)
        let optionsAmm = 0;
        for (let i = 1; i < 12; i++) {

            if (corp.redStarRoles.redStarRoles.get(i.toString())) {
                selectRsLevel.addOptions([
                    {
                        label: `Level ${i}`,
                        value: `${i}`,
                        default: AuthorRoles.includes(corp.redStarRoles.redStarRoles.get(i.toString()))
                    }
                ])
                optionsAmm++;
            }
        }
        selectRsLevel.setMaxValues(optionsAmm)

        let firstRow = new MessageActionRow()
        firstRow.addComponents(selectRsLevel)

        await b.reply({ components: [firstRow], ephemeral: true })
    });


}