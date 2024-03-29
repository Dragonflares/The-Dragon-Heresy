import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu} from 'discord.js';

export class SetTimezoneCommand extends MemberCommand{
    constructor(plugin){
        super(plugin, {
            name: 'settimezone',
            aliases: ['stime','stz'],
            description: "Sets your time zone to GMT standard.",
            usage: "&settimezone"
        });
    }

    async run(message, args){
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.author
        }
        else if (message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's timezone!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').populate('reminders').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        //Timezones
        
        const timezones = new Map([
            ["(GMT -12:00) Eniwetok, Kwajalein", "-12.00"],
            ["(GMT -11:00) Midway Island, Samoa", "-11.00"],
            ["(GMT -10:00) Hawaii", "-10.00"],
            ["(GMT -9:30) Taiohae", "-09.50"],
            ["(GMT -9:00) Alaska", "-09.00"],
            ["(GMT -8:00) Pacific Time (US/Canada)", "-08.00"],
            ["(GMT -7:00) Mountain Time (US/Canada)", "-07.00"],
            ["(GMT -6:00) Central Time (US/Canada), Mexico City", "-06.00"],
            ["(GMT -5:00) Eastern Time (US/Canada), Bogota, Lima", "-05.00"],
            ["(GMT -4:30) Caracas", "-04.50"],
            ["(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz", "-04.00"],
            ["(GMT -3:30) Newfoundland", "-03.50"],
            ["(GMT -3:00) Brazil, Buenos Aires, Georgetown", "-03.00"],
            ["(GMT -2:00) Mid-Atlantic", "-02.00"],
            ["(GMT -1:00) Azores, Cape Verde Islands", "-01.00"],
            ["(GMT) Western Europe Time, London, Lisbon, Casablanca", "+00.00"],
            ["(GMT +1:00) Brussels, Copenhagen, Madrid, Paris", "+01.00"],
            ["(GMT +2:00) Kaliningrad, South Africa, Jerusalem", "+02.00"],
            ["(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg", "+03.00"],
            ["(GMT +3:30) Tehran", "+03.50"],
            ["(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi", "+04.00"],
            ["(GMT +4:30) Kabul", "+04.50"],
            ["(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent", "+05.00"],
            ["(GMT +5:30) Bombay, Calcutta, Madras, New Delhi", "+05.50"],
            ["(GMT +5:45) Kathmandu, Pokhara", "+05.75"],
            ["(GMT +6:00) Almaty, Dhaka, Colombo", "+06.00"],
            ["(GMT +6:30) Yangon, Mandalay", "+06.50"],
            ["(GMT +7:00) Bangkok, Hanoi, Jakarta", "+07.00"],
            ["(GMT +8:00) Beijing, Perth, Singapore, Hong Kong", "+08.00"],
            ["(GMT +8:45) Eucla", "+08.75"],
            ["(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk", "+09.00"],
            ["(GMT +9:30) Adelaide, Darwin", "+09.50"],
            ["(GMT +10:00) Eastern Australia, Guam, Vladivostok", "+10.00"],
            ["(GMT +10:30) Lord Howe Island", "+10.50"],
            ["(GMT +11:00) Magadan, Solomon Islands, New Caledonia", "+11.00"],
            ["(GMT +11:30) Norfolk Island", "+11.50"],
            ["(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka", "+12.00"],
            ["(GMT +12:45) Chatham Islands", "+12.75"],
            ["(GMT +13:00) Apia, Nukualofa", "+13.00"],
            ["(GMT +14:00) Line Islands, Tokelau", "+14.00"]
        ])

        //Create message
        let embed = await this.SendMessage(member.timezone)

        //Create Menus
        //let options = []

        // Timezones -12 to 0
        let timezonesMenu1 = new MessageSelectMenu()
            .setCustomId('gmt')
            .setPlaceholder('GMT -12 to 0')

        for (let i = 0; i < 16; i++) {
                timezonesMenu1.addOptions([
                    {
                    label: `${[...timezones][i][0]}`,
					value: `${[...timezones][i][1]}`,
                    }
                ])
        }

        // Timezones 0 to 14
        let timezonesMenu2 = new MessageSelectMenu()
            .setCustomId('gmt1')
            .setPlaceholder('GMT 1 to +14')

        //let options1 = []
        for (let i = 16; i < 40; i++) {
             timezonesMenu2.addOptions([
                {
                label: `${[...timezones][i][0]}`,
                value: `${[...timezones][i][1]}`,
                }
            ])
        }

        //Saving daylight option
        let timezonesMenu3 = new MessageSelectMenu()
        .setCustomId('summer')
        .setPlaceholder('Daylight Saving Time?')
        timezonesMenu3.addOptions([
            {
                label: `Yes`,
                value: `1`,
            },
            {
                label: `No`,
                value: `0`,
            },
        ])

        let thirdRow = new MessageActionRow()
        thirdRow.addComponents(timezonesMenu3)
          

        //Add Rows
        let firstRow = new MessageActionRow()
        firstRow.addComponents(timezonesMenu1)

        let secondRow = new MessageActionRow()
        secondRow.addComponents(timezonesMenu2)

        //Add cancel and save
        let forthRow = new MessageActionRow()
        let buttonCancel = new MessageButton()
            .setStyle(4)
            .setLabel("Cancel")
            .setCustomId("cancel")

        let buttonSave = new MessageButton()
            .setStyle(3)
            .setLabel("Save")
            .setCustomId("save")

        forthRow.addComponents(buttonCancel);
        forthRow.addComponents(buttonSave);
     

        //Send message
        let messageReaction = await message.channel.send({embeds: [embed],  components: [firstRow,secondRow,thirdRow,forthRow] });
        
        const filter = (button) => button.user.bot == false;

        //Open buttn and menu collectors
        const collector = messageReaction.createMessageComponentCollector({filter,  time: 2*60* 1000});

        let tz =0;
        let currSumm = 0

        //Menu selected
        collector.on('collect', async b => {        
            if (b.user.id == member.discordId) {
                if (b.customId == "cancel") {
                    let msgEmbed = await this.SendMessage(member.timezone)
                    msgEmbed.setColor("RED")
                    messageReaction.edit({ components: [], embeds: [msgEmbed] });
                    await b.reply({ content: 'Canceled', ephemeral: true})

                } else if (b.customId == "save") {
                    let fin = tz
                    if (currSumm != 0)
                    {
                        fin = (parseFloat(tz) + parseInt(currSumm));
                        if (fin >0) {
                            fin = "+" + (parseFloat(tz) + parseInt(currSumm)).toFixed(2);
                        }else {
                            fin =(parseFloat(tz) + parseInt(currSumm)).toFixed(2);
                        }
                    }
                    Member.findOneAndUpdate({discordId: target.id.toString()}, {timezone: fin})
                    .catch(err => console.log(err))

                    let msgEmbed = await this.SendMessage(fin);
                    messageReaction.edit({ components: [], embeds: [msgEmbed] });
                    await b.reply({ content: 'Saved', ephemeral: true})
                }
                else if (b.customId == "gmt") {
                    tz = b.values[0]
                } else if (b.customId == "gmt1") {
                    tz = b.values[0]
                } else if (b.customId == "summer") {
                    currSumm = b.values[0]
                }else{
                    await b.deferUpdate()
                    return;
                }

                if(b.customId == "gmt" || b.customId == "gmt1" || b.customId == "summer")
                {
                    let fin = tz
                    if (currSumm != 0)
                    {
                        fin = (parseFloat(tz) + parseInt(currSumm));
                        if (fin >0) {
                            fin = "+" + (parseFloat(tz) + parseInt(currSumm)).toFixed(2);
                        }else {
                            fin =(parseFloat(tz) + parseInt(currSumm)).toFixed(2);
                        }
                    }
                    b.deferUpdate().catch(e=>console.log(e));
                    let embed = await this.SendMessage(fin)
                    messageReaction.edit({embeds:[embed]})
                }
            }else{
                await b.reply({content:'Not your setup.', ephemeral: true})
            }
        });
        collector.on('end', async collected => {
            let msgEmbed = await this.SendMessage(member.timezone)
            msgEmbed.setColor("RED")
            messageReaction.edit({ components: [], embeds: [msgEmbed] })
        });

    }

    async SendMessage(timezone) {
        let embed = new MessageEmbed().setColor("GREEN")
        embed.setTitle(`**Set Timezone**`);
        embed.setThumbnail("https://i.imgur.com/4x0nZeS.png")
        embed.setDescription("Setup your timezone.")

        let playerCurrentTime = `Timezone not setup`
        if (timezone != "+0") {
            let today = new Date()
            today = new Date(today.getTime() + today.getTimezoneOffset() * 60 * 1000);
            today = new Date(today.getTime() + timezone * 60 * 60 * 1000);
            playerCurrentTime = `${today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} (GMT ${timezone})`
        }

        embed.addField('*Selected Timezone:*', timezone.toString());
        embed.addField('*Your current time:*', playerCurrentTime);
        return embed
    }

    modifyTimeZone = async (target, NewTimezone, message) => {
        Member.findOneAndUpdate({discordId: target.id.toString()}, {timezone: NewTimezone})
        .catch(err => console.log(err))
        return message.channel.send(`Time Zone updated.`)
    }
}