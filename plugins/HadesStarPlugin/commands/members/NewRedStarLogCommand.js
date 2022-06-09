import { MemberCommand } from './MemberCommand';
import { Corp, RedStarLog } from '../../database'
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } from 'discord.js';

export class NewRedStarLogCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'newredstarlog',
            aliases: ['nrslog', 'n'],
            description: "Checks general corp redstars log or a specific player if added name () (Must Mention)",
            usage: "&nrslog (total, top, last, mention name)",
            hidden: true
        });
    }

    async run(message, args) {
        message.delete({ timeout: 1 });    //Delete User message
        /*  if (message.mentions.users.first()) {
              this.sendLog(message, message.mentions.users.first()); //Send recuit message
          }
          else if (args[0] == "top") {
              this.sendTopLog(message); //Send top message
          }
          else if (args[0] == "last") {
              this.sendLastLog(message); //Send last message
  
          } else {
              this.sendGeneralLog(message); //Send general message
          }*/
        this.startLogMessage(message, args);
    }
    async startLogMessage(message, args) {
        //Get corp
        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();

        //Get initial day
        let startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        //rs levels
        let levels = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]


        //Create buttons
        let firstRow = new MessageActionRow()
        let secondRow = new MessageActionRow()
        let buttonDate = new MessageButton()
            .setStyle(2)
            .setLabel("Filter Date")
            .setCustomId("date")

        let buttonLevel = new MessageButton()
            .setStyle(2)
            .setLabel("Filter Level")
            .setCustomId("level")

        let buttonShowMember = new MessageButton()
            .setStyle(3)
            .setLabel("Show by member")
            .setCustomId("member")


        let buttonShowRedstar = new MessageButton()
            .setStyle(4)
            .setLabel("Show by redstar")
            .setCustomId("redstar")

        firstRow.addComponents(buttonShowMember);
        firstRow.addComponents(buttonShowRedstar);
        secondRow.addComponents(buttonDate);
        secondRow.addComponents(buttonLevel);



        let generalEmbed = await this.showByRedstar(corp, levels, startOfDay,new Date())

        let messageReaction = await message.channel.send({ embeds: [generalEmbed], components: [firstRow, secondRow] });
        const filter = (button) => button.user.bot == false;

        //Open components  collectors
        const collector = messageReaction.createMessageComponentCollector({ filter, time: 2 * 60 * 1000 });

        collector.on('collect', async b => {
            if (b.user.id == message.author.id) {
                if (b.customId == "redstar") {
                    let generalEmbed = await this.showByRedstar(corp, levels, startOfDay,new Date())
                    await messageReaction.edit({ embeds: [generalEmbed] })
                } else if (b.customId == "member") {
                    let generalEmbed = await this.showByMember(corp, levels, startOfDay,new Date())
                    await messageReaction.edit({ embeds: [generalEmbed] })
                }
            }
            await b.deferUpdate()
        })
    }

    async getInitialEmbed(corp, dateStart, dateEnd) {
        let emb = new MessageEmbed()
            .setTitle(`${corp.name} Red Stars General Summary:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server.\n (Succeed,Timeout)`)
            .setColor("GREEN")

        if (!dateEnd)
            emb.setFooter({ text: `This information is from today (${dateStart.getDate()}/${dateStart.getMonth() + 1}/${dateStart.getFullYear()}).` })
        else
            emb.setFooter({
                text: `This information is from ${dateStart.getDate()}/${dateStart.getMonth() + 1}/${dateStart.getFullYear()} to 
        ${dateEnd.getDate()}/${dateEnd.getMonth() + 1}/${dateEnd.getFullYear()}.`
            })
        return emb
    }

    async showByMember(corp, levels, date, enddate) {
        //Start Embed
        let generalEmbed = await this.getInitialEmbed(corp, date)

        //Get Data
        let data = await this.getRsLogData(corp, date, enddate)
        let map = await this.getMapByMember(data, levels)
        map.forEach((values, keys) => {
            if (values)
                generalEmbed.addField(keys, values)
        })
        return generalEmbed
    }

    async showByRedstar(corp, levels, date, enddate) {
        //Start Embed
        let generalEmbed = await this.getInitialEmbed(corp, date)

        //Get Data
        let data = await this.getRsLogData(corp, date, enddate)
        let map = await this.getMapByRedstar(data, levels)
        map.forEach((values, keys) => {
            if (values)
                generalEmbed.addField(keys, values)
        })

        return generalEmbed
    }

    async getRsLogData(corp, date,enddate) {
        let logs = await RedStarLog.find({ corpOpened: corp, "timeClosed": { "$gte": date , "$lte": enddate }}).exec()
        return logs
    }

    async getMapByMember(data, levels) {
        let map = new Map()

        map.set("lol", "lal")

        return map
    }

    async getMapByRedstar(data, levels) {
        let map = new Map()
        let text = ""
        //Level Stuff
        levels.forEach(level => {
            let totalLevelTimeout = data.filter(log => log.level == level).filter(log => log.endStatus == "Timeout")
            let totalLevelSucceeded = data.filter(log => log.level == level).filter(log => log.endStatus == "Succeeded")
            if (totalLevelTimeout.length > 0 || totalLevelSucceeded.length > 0) {
                //let totalStr = `**__Total:__** \n__Succeed__: ${totalLevelSucceeded.length}\n`
                //totalStr += `__Timeout__: ${totalLevelTimeout.length}\n`
                //  text += `**RS${level}** ${totalStr}`
                let player_success = new Map()
                let player_timeout = new Map()
                totalLevelSucceeded.forEach(log => {
                    log.membersIds.forEach(member => {
                        if (player_success.get(member))
                            player_success.set(member, player_success.get(member) + 1)
                        else
                            player_success.set(member, 1)
                    })
                })

                totalLevelTimeout.forEach(log => {
                    log.membersIds.forEach(member => {
                        if (player_timeout.get(member))
                            player_timeout.set(member, player_timeout.get(member) + 1)
                        else
                            player_timeout.set(member, 1)
                    })
                })

                //One common aarray
                var a = Array.from(player_success.keys())
                var b =  Array.from(player_timeout.keys())
                var c = a.concat(b.filter((item) => a.indexOf(item) < 0))
                let totalStr = ""

                c.forEach(id =>{
                    let suc = 0
                    if(player_success.get(id)) suc = player_success.get(id)
                    let time =0
                    if(player_timeout.get(id)) time = player_timeout.get(id)
                    totalStr+= `<@${id}> (${suc}/${time})\n`
                })

                map.set(`**RS${level}** (${totalLevelSucceeded.length},${totalLevelTimeout.length})`, totalStr)
            }
        })

        return map
    }

    /* async sendGeneralLog(message) {
 
         let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();
 
         let generalEmbed = new MessageEmbed()
             .setTitle(`${corp.name} Red Stars General Summary:`)
             .setThumbnail("https://i.imgur.com/hedXFRd.png")
             .setDescription(`This information are from closed queues in the corp server. (Filled/Timeout)`)
             .setColor("GREEN")
             .setFooter({text: `You can mention a player to see his specific stats in the corp!`})
 
 
         //Get Last Month
         let d = new Date()
         let checkDate = new Date(d.setMonth(d.getMonth() - 1))
 
         let totalTimeout = await RedStarLog.find({corpOpened: corp._id,endStatus: "Timeout"}).exec()
         let totalSucceeded = await RedStarLog.find({corpOpened: corp._id,endStatus: "Succeeded"}).exec()
         let monthlyTimeout = totalTimeout.filter(log => log.timeClosed > checkDate)
         let monthySucceeded = totalSucceeded.filter(log => log.timeClosed > checkDate)
 
         //Total
         let totalStr = `__Succeeded:__ ${totalSucceeded.length}    (${monthySucceeded.length} this month)\n`
         totalStr += `__Timeout:__ ${totalTimeout.length}   (${monthlyTimeout.length} this month)\n`
         generalEmbed.addField("Total", totalStr)
 
 
         //Level Stuff
         for (let level = 11; level >= 1; level--) {
 
             let totalLevelTimeout = totalTimeout.filter(log => log.level == level)
             let totalLevelSucceeded = totalSucceeded.filter(log => log.level == level)
             let monthlyLevelTimeout = totalLevelTimeout.filter(log => log.timeClosed > checkDate)
             let monthyLevelSucceeded = totalLevelSucceeded.filter(log =>log.timeClosed > checkDate)
 
             if (totalLevelTimeout.length > 0 || totalLevelSucceeded.length > 0) {
                 let totalStr = `__Succeeded:__ ${totalLevelSucceeded.length}    (${monthyLevelSucceeded.length} this month)\n`
                 totalStr += `__Timeout:__ ${totalLevelTimeout.length}   (${monthlyLevelTimeout.length} this month)\n`
                 generalEmbed.addField(`Level ${level}`, totalStr)
             }
         }
 
         return message.channel.send({embeds:[generalEmbed]});
     }
 
     async sendLog(message, target) {
 
         let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate('redStarLogs').exec();
 
         let mentionedName = message.guild.members.fetch(target).nickname
         if (!mentionedName) mentionedName = target.username
 
         let generalEmbed = new MessageEmbed()
             .setTitle(`${mentionedName} Red Stars General Summary in ${corp.name}:`)
             .setThumbnail("https://i.imgur.com/hedXFRd.png")
             .setDescription(`This information are from closed queues in the corp server, Joined includes Created. (Filled/Timeout)`)
             .setColor("GREEN")
             .setFooter({text: `You can see top players by doing &rslog top !`})
 
 
         //Get info
         let d = new Date()
         let checkDate = new Date(d.setMonth(d.getMonth() - 1))
 
         let totalCreatorTimeout = await RedStarLog.find({corpOpened: corp._id, endStatus: "Timeout", creatorId: target.id}).exec()
         let totalCreatorSucceeded = await RedStarLog.find({corpOpened: corp._id, endStatus: "Succeeded", creatorId: target.id}).exec()
         let monthlyCreatorTimeout = totalCreatorTimeout.filter(log => log.timeClosed > checkDate);
         let monthyCreatorSucceeded = totalCreatorSucceeded.filter(log => log.timeClosed > checkDate);
        
         //Total Created
         let totalStr = `__Succeeded:__ ${totalCreatorSucceeded.length}    (${monthyCreatorSucceeded.length} this month)\n`
         totalStr += `__Timeout:__ ${totalCreatorTimeout.length}   (${monthlyCreatorTimeout.length} this month)\n`
         generalEmbed.addField("Total Created", totalStr)
 
         //Total Joined
 
         let totalJoinedTimeout = await RedStarLog.find({corpOpened: corp._id, endStatus: "Timeout", membersIds: { $in: [target.id]}}).exec()
         let totalJoinedSucceeded = await RedStarLog.find({corpOpened: corp._id, endStatus: "Succeeded", membersIds: { $in: [target.id]}}).exec()
         let monthlyJoinedTimeout = totalCreatorTimeout.filter(log => log.timeClosed > checkDate);
         let monthyJoinedSucceeded = totalCreatorSucceeded.filter(log => log.timeClosed > checkDate);
 
         let totalJoinedStr = `__Succeeded:__ ${totalJoinedSucceeded.length}    (${monthyJoinedSucceeded.length} this month)\n`
         totalJoinedStr += `__Timeout:__ ${totalJoinedTimeout.length}   (${monthlyJoinedTimeout.length} this month)\n`
 
         generalEmbed.addField("Total Joined", totalJoinedStr)
         return message.channel.send({embeds: [generalEmbed]});
     }
     async sendTopLog(message) {
 
         let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate('redStarLogs').exec();
 
         let generalEmbed = new MessageEmbed()
             .setTitle(`${corp.name} Red Stars Top 5 Players:`)
             .setThumbnail("https://i.imgur.com/hedXFRd.png")
             .setDescription(`This information are from closed queues in the corp server, Joined includes Created.`)
             .setColor("GREEN")
             .setFooter({text:`You can see general information with &rslog or &rslog total`})
 
         //Get last month
         let d = new Date()
         let checkDate = new Date(d.setMonth(d.getMonth() - 1))
 
         //Monthly
         let playerMonthlyCreated = new Map()
         let playerMonthlyJoined = new Map()
  
         await RedStarLog.find({corpOpened: corp._id,endStatus: "Succeeded",timeClosed: {"$gt": checkDate}}).exec().then( logs => {
             logs.forEach(log => {
                 if (!playerMonthlyCreated.get(log.creatorId))
                     playerMonthlyCreated.set(log.creatorId, 1)
                 else
                     playerMonthlyCreated.set(log.creatorId, playerMonthlyCreated.get(log.creatorId) + 1)
                 
                 if(log.membersIds)
                 log.membersIds.forEach(m => {
                     if (!playerMonthlyJoined.get(m))
                         playerMonthlyJoined.set(m, 1)
                     else
                         playerMonthlyJoined.set(m, playerMonthlyJoined.get(m) + 1)
                 })
             })
            
         })
 
         let strMonthly = "**Created Successfully**\n"
         strMonthly += await this.getTop5StringFromMap(message, playerMonthlyCreated)
         strMonthly += "**Joined Sucessfully**\n"
         strMonthly += await this.getTop5StringFromMap(message, playerMonthlyJoined)
         generalEmbed.addField("This Month:", strMonthly)
 
         //Total
         let playerTotalCreated = new Map()
         let playerTotalJoined = new Map()
        
         await RedStarLog.find({corpOpened: corp._id,endStatus: "Succeeded"}).exec().then( logs => {
             logs.forEach(log => {
             if (!playerTotalCreated.get(log.creatorId))
                 playerTotalCreated.set(log.creatorId, 1)
             else
                 playerTotalCreated.set(log.creatorId, playerTotalCreated.get(log.creatorId) + 1)
                 log.membersIds.forEach(m => {
                     if (!playerTotalJoined.get(m))
                         playerTotalJoined.set(m, 1)
                     else
                         playerTotalJoined.set(m, playerTotalJoined.get(m) + 1)
                     })
                 })
                
             })
 
         let strTotal = "**Created Successfully**\n"
         strTotal += await this.getTop5StringFromMap(message, playerTotalCreated)
         strTotal += "**Joined Sucessfully**\n"
         strTotal += await this.getTop5StringFromMap(message, playerTotalJoined)
         generalEmbed.addField("Total:", strTotal)
 
         return message.channel.send({embeds: [generalEmbed]});
     }
 
 
 
 
     async sendLastLog(message) {
         return message.channel.send("last month");
     }
 
     async getTop5StringFromMap(message, map) {
         let arr = Array.from(map)
         let string = ""
         arr = arr.sort(([keya, valuea], [keyb, valueb]) => valuea < valueb ? 1 : -1)
         if (arr.length == 0) { string += `None\n` } else {
             for (let i = 0; i < 5; i++) {
                 if (i >= arr.length) break;
                 let mentionedName = message.guild.member(arr[i][0])
                 if (!mentionedName) mentionedName = await this.client.users.fetch(arr[i][0], { cache: true });
 
                 string += `${mentionedName} ${arr[i][1]}\n`
             }
         }
 
         return string
     }*/

}
