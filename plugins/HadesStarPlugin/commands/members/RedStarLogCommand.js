import { MemberCommand } from './MemberCommand';
import { Corp, RedStarLog } from '../../database'
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } from 'discord.js';
import { confirmResultButtons } from '../../utils';

export class NewRedStarLogCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'redstarlog',
            aliases: ['rslog', 'rsl'],
            description: "Checks general corp redstars log or a specific player if added name () (Must Mention)",
            usage: "&rslog (total, top, last, mention name)"
        });
    }

    async run(message, args) {
        message.delete({ timeout: 1 });    //Delete User message
        let targetID = null
        if (args[0] || message.mentions.users.first()) {

            if (message.mentions.users.first()) {
                targetID = message.mentions.users.first().id.toString()
            } else {
                let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
                let memberslist = new Map(corp.members.map(t => [t.name, t]))
                let member = await confirmResultButtons(message, args.join(' '), [...memberslist.keys()])
                if(!member) return
                targetID = memberslist.get(member).discordId.toString()
            }

        }
        this.startLogMessage(message, targetID);
    }
    async startLogMessage(message, targetId) {
        //Get corp
        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();

        //Get initial day
        let startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        //rs levels
        let levels = ["11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"]

        //Current window showns
        let messsageShown = "redstar";

        //Variables
        let dateEnd = new Date()
        let todayString = `${dateEnd.getDate()}/${dateEnd.getMonth() + 1}/${dateEnd.getFullYear()}`
        let targetID = targetId
        //times used
        let startTime = startOfDay
        let endTime = dateEnd

        //Create buttons
        let firstRow = new MessageActionRow()
        let secondRow = new MessageActionRow()
        let buttonDate = new MessageButton().setStyle(2).setLabel("Filter Date").setCustomId("date")
        let buttonLevel = new MessageButton().setStyle(2).setLabel("Filter Level").setCustomId("level")
        let buttonShowMember = new MessageButton().setStyle(3).setLabel("Show by member").setCustomId("member")
        let buttonShowRedstar = new MessageButton().setStyle(4).setLabel("Show by redstar").setCustomId("redstar")

        firstRow.addComponents([buttonShowMember, buttonShowRedstar])
        secondRow.addComponents([buttonDate, buttonLevel])

        let generalEmbed = await this.makeEmbed(corp, levels, targetID, messsageShown, startTime, endTime)
        let messageReaction = await message.channel.send({ embeds: [generalEmbed], components: [firstRow, secondRow] });

        //Open components  collectors
        const filter = (button) => button.user.bot == false;
        const collector = messageReaction.createMessageComponentCollector({filter, time: 2 * 60 * 1000 });

        //listener filters
        let rsLevelMenuFilter = null
        let rsDateModalFilter = null

        collector.on('collect', async b => {
            if (b.user.id == message.author.id) {
                if (b.customId == "redstar" || b.customId == "member") {
                    await b.deferUpdate()
                    messsageShown = b.customId
                    generalEmbed = await this.makeEmbed(corp, levels, targetID, messsageShown, startTime, endTime)
                    await messageReaction.edit({ embeds: [generalEmbed] })

                } else if (b.customId == "level") {

                    //Create Menu    
                    rsLevelMenuFilter = b.id + "-rslevel"
                    let selectRsLevel = new MessageSelectMenu()
                        .setCustomId(rsLevelMenuFilter)
                        .setPlaceholder('Redstar Level')
                        .setMinValues(0)
                        .setMaxValues(11)

                    for (let i = 1; i < 12; i++) {
                        selectRsLevel.addOptions([
                            {
                                label: `Level ${i}`,
                                value: `${i}`,
                                default: levels.includes(i.toString())
                            }
                        ])
                    }
                    let firstRow = new MessageActionRow()
                    firstRow.addComponents(selectRsLevel)
                    await b.reply({ components: [firstRow], ephemeral: true })

                } else if (b.customId == "date") {

                    // Create the modal
                    rsDateModalFilter = b.id + "-dateModal"
                    const modal = new Modal().setCustomId(rsDateModalFilter).setTitle('Select dates window to filter logs');
                    const startDateInput = new TextInputComponent().setCustomId('rslogStartdate')
                        .setLabel("Start Date:")
                        .setStyle('SHORT')
                        .setPlaceholder(todayString)
                    const endDateInput = new TextInputComponent().setCustomId('rslogEndDate')
                        .setLabel("End Date:")
                        .setStyle('SHORT')
                        .setPlaceholder(todayString)

                    const firstActionRow = new MessageActionRow().addComponents(startDateInput);
                    const secondActionRow = new MessageActionRow().addComponents(endDateInput);

                    // Add inputs to the modal
                    modal.addComponents(firstActionRow, secondActionRow);

                    return b.showModal(modal)
                }
            }else{
                await b.deferUpdate()
            }

        })
        //menu
        this.client.on('interactionCreate', async (interaction) => {
            if (interaction.customId == rsLevelMenuFilter) {
                levels = interaction.values.sort((a, b) => b - a)
                if (messsageShown == "redstar" || messsageShown == "member") {
                    generalEmbed = await this.makeEmbed(corp, levels, targetID, messsageShown, startTime, endTime)
                    await messageReaction.edit({ embeds: [generalEmbed] })
                    await interaction.update({ content: "Fiter updated", components: [], ephemeral: true })
                }
            }
            else if (interaction.customId == rsDateModalFilter) {
                let startDateInput = interaction.fields.getTextInputValue('rslogStartdate');
                let endDateInput = interaction.fields.getTextInputValue('rslogEndDate');
                if (startDateInput == "") startDateInput = todayString
                if (endDateInput == "") endDateInput = todayString
                //make dates
                var startDate = new Date(startDateInput.replace(/(\d+[/])(\d+[/])/, '$2$1'));
                var endDate = new Date(endDateInput.replace(/(\d+[/])(\d+[/])/, '$2$1'));
                if (isNaN(startDate.getTime())) {
                    await interaction.update({ content: "Wrong start date format", ephemeral: true })
                } else if (isNaN(endDate.getTime())) {
                    await interaction.update({ content: "Wrong end date format", ephemeral: true })
                } else {

                    //save times and make start start of day and end end of day
                    startTime = startDate
                    startTime.setHours(0, 0, 0, 0);
                    endTime = endDate
                    endTime.setHours(23, 59, 59, 0);

                    generalEmbed = await this.makeEmbed(corp, levels, targetID, messsageShown, startTime, endTime)
                    await messageReaction.edit({ embeds: [generalEmbed] })
                    await interaction.reply({ content: "Filter updated", components: [], ephemeral: true })
                }
            }
        })

        collector.on('end', async collected => {
            generalEmbed.setColor("RED")
            messageReaction.edit({ components: [], embeds: [generalEmbed] })
        });
    }

    async getInitialEmbed(corp, dateStart, dateEnd) {
        let emb = new MessageEmbed()
            .setTitle(`${corp.name} Red Stars General Summary:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server.\n (Succeed/Timeout)`)
            .setColor("GREEN")

        if (dateStart.getDate() == dateEnd.getDate() && dateStart.getMonth() == dateEnd.getMonth() && dateStart.getFullYear() == dateEnd.getFullYear())
            emb.setFooter({ text: `This information is from today (${dateStart.getDate()}/${dateStart.getMonth() + 1}/${dateStart.getFullYear()}).` })
        else
            emb.setFooter({
                text: `This information is from ${dateStart.getDate()}/${dateStart.getMonth() + 1}/${dateStart.getFullYear()} to ${dateEnd.getDate()}/${dateEnd.getMonth() + 1}/${dateEnd.getFullYear()}.`
            })
        return emb
    }

    async makeEmbed(corp, levels, targetID, type, date, enddate) {
        //Start Embed
        let generalEmbed = await this.getInitialEmbed(corp, date, enddate)

        //Get Data
        let data
         if (!targetID)
             data = await RedStarLog.find({ corpOpened: corp, "timeClosed": { "$gte": date, "$lte": enddate } }).exec()
         else
             data = await RedStarLog.find({ corpOpened: corp, "timeClosed": { "$gte": date, "$lte": enddate }, membersIds: { $in: [targetID] } }).exec()

        let map
        if (type == "redstar")
            map = await this.getMapByRedstar(data, levels, targetID)
        else
            map = await this.getMapByMember(data, levels, targetID)
        let size = 0

        map.forEach((values, keys) => {
            if (values) {
                size += values.length
                generalEmbed.addField(keys, values)
            }
        })
        if (size > 5000) {

            generalEmbed = await this.getInitialEmbed(corp, date, enddate)
            generalEmbed.addField("Data:", "too much info")
        }
        return generalEmbed
    }

    async getMapByMember(data, levels, targetID) {
        let map = new Map()
        let player_success = new Map()
        let player_timeout = new Map()
        let totalLevelTimeout = data.filter(log => log.endStatus == "Timeout").filter(log => levels.includes(log.level.toString()))
        let totalLevelSucceeded = data.filter(log => log.endStatus == "Succeeded").filter(log => levels.includes(log.level.toString()))

        totalLevelSucceeded.forEach(log => {
            log.membersIds.forEach(member => {
                if (targetID && targetID != member) return;
                if (player_success.get(member))
                    player_success.set(member, player_success.get(member) + 1)
                else
                    player_success.set(member, 1)
            })
        })

        totalLevelTimeout.forEach(log => {
            log.membersIds.forEach(member => {
                if (targetID && targetID != member) return;
                if (player_timeout.get(member))
                    player_timeout.set(member, player_timeout.get(member) + 1)
                else
                    player_timeout.set(member, 1)
            })
        })
        //One common array
        var a = Array.from(player_success.keys())
        var b = Array.from(player_timeout.keys())
        var c = a.concat(b.filter((item) => a.indexOf(item) < 0))
        let totalStr = []
        let midstr=""
        c.sort((a,b) => {
            let suc = 0
            if (player_success.get(a)) suc = player_success.get(a)
            let time = 0
            if (player_timeout.get(a)) time = player_timeout.get(a)
           let aTotal = suc+time

           suc = 0
           if (player_success.get(b)) suc = player_success.get(b)
           time = 0
           if (player_timeout.get(b)) time = player_timeout.get(b)
          let bTotal = suc+time       

          return bTotal-aTotal

        })
        c.forEach(id => {
            let suc = 0
            if (player_success.get(id)) suc = player_success.get(id)
            let time = 0
            if (player_timeout.get(id)) time = player_timeout.get(id)
            midstr += `<@${id}> (${suc}/${time})\n`
            if(midstr.length >800)
            {
                totalStr.push(midstr)
                midstr=""
            }
        })
        totalStr.push(midstr)

        if(totalStr.length == 1) {
            map.set(`Members:`, totalStr[0])
        }else{
            totalStr.forEach((s, i) => {
                map.set(`Members:(${i + 1}/${totalStr.length})`, s)
             })
        } 
        return map
    }

    async getMapByRedstar(data, levels, targetID) {
        let map = new Map()
        let text = ""
        //Level Stuff
        levels.forEach(level => {
            let totalLevelTimeout = data.filter(log => log.level == level).filter(log => log.endStatus == "Timeout")
            let totalLevelSucceeded = data.filter(log => log.level == level).filter(log => log.endStatus == "Succeeded")
            if (totalLevelTimeout.length > 0 || totalLevelSucceeded.length > 0) {
                let player_success = new Map()
                let player_timeout = new Map()
                totalLevelSucceeded.forEach(log => {
                    log.membersIds.forEach(member => {
                        if (targetID && targetID != member) return;
                        if (player_success.get(member))
                            player_success.set(member, player_success.get(member) + 1)
                        else
                            player_success.set(member, 1)
                    })
                })

                totalLevelTimeout.forEach(log => {
                    log.membersIds.forEach(member => {
                        if (targetID && targetID != member) return;
                        if (player_timeout.get(member))
                            player_timeout.set(member, player_timeout.get(member) + 1)
                        else
                            player_timeout.set(member, 1)
                    })
                })

                //One common array
                var a = Array.from(player_success.keys())
                var b = Array.from(player_timeout.keys())
                var c = a.concat(b.filter((item) => a.indexOf(item) < 0))
                c.sort((a,b) => {
                    let suc = 0
                    if (player_success.get(a)) suc = player_success.get(a)
                    let time = 0
                    if (player_timeout.get(a)) time = player_timeout.get(a)
                   let aTotal = suc+time
        
                   suc = 0
                   if (player_success.get(b)) suc = player_success.get(b)
                   time = 0
                   if (player_timeout.get(b)) time = player_timeout.get(b)
                  let bTotal = suc+time       
        
                  return bTotal-aTotal
        
                })
                let totalStr = ""

                c.forEach(id => {
                    let suc = 0
                    if (player_success.get(id)) suc = player_success.get(id)
                    let time = 0
                    if (player_timeout.get(id)) time = player_timeout.get(id)
                    totalStr += `<@${id}> (${suc}/${time})\n`
                })

                map.set(`**RS${level}** (${totalLevelSucceeded.length}/${totalLevelTimeout.length})`, totalStr)
            }
        })
        return map
    }
}