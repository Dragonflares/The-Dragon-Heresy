import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';
import { Modal, MessageButton, MessageActionRow, TextInputComponent  } from 'discord.js';

export class TestCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'test',
            aliases: [''],
            description: "Test",
            usage: "&test",
            hidden: true
        });
    }

    async run(message, args) {
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.author
        }

        let acceptButton = new MessageButton()
        .setStyle(3)
        .setLabel('Start')
        .setCustomId('Accept')

        let firstRow = new MessageActionRow()
        firstRow.addComponents(acceptButton)


        
       let messageReaction = await message.channel.send({content:"Testing", components:[firstRow], ephemeral: true })
       const filter = (button) => button.user.bot == false;
       const collector = messageReaction.createMessageComponentCollector({filter, time: 2 * 60 * 1000});

       collector.on('collect', async b => {
        // Create the modal
        const modal = new Modal()
        .setCustomId('myModal')
        .setTitle('My Testing');
        // Add components to modal
        // Create the text input components
        const favoriteColorInput = new TextInputComponent()
        .setCustomId('favoriteColorInput')
        // The label is the prompt the user sees for this input
        .setLabel("How much you love Pencol?")
        // Short means only a single line of text
        .setStyle('SHORT');
        const hobbiesInput = new TextInputComponent()
        .setCustomId('hobbiesInput')
        .setLabel("Tell me more.")
        // Paragraph means multiple lines of text.
        .setStyle('PARAGRAPH');
        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new MessageActionRow().addComponents(favoriteColorInput);
        const secondActionRow = new MessageActionRow().addComponents(hobbiesInput);
        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

            return b.showModal(modal)
        })
       
       }
    }

