import { MemberCommand } from './MemberCommand';
import { Corp, RedStarLog } from '../../database'
const Discord = require('discord.js');

export class RedStarLogCommand extends MemberCommand {
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


        if (message.mentions.users.first()) {
            this.sendLog(message, message.mentions.users.first()); //Send recuit message
        }
        else if (args[0] == "top") {
            this.sendTopLog(message); //Send top message
        }
        else if (args[0] == "last") {
            this.sendLastLog(message); //Send last message

        } else {
            this.sendGeneralLog(message); //Send general message
        }
    }

    async sendGeneralLog(message) {

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).exec();

        let generalEmbed = new Discord.MessageEmbed()
            .setTitle(`${corp.name} Red Stars General Summary:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server. (Filled/Timeout)`)
            .setColor("GREEN")
            .setFooter(`You can mention a player to see his specific stats in the corp!`)


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

        return message.channel.send(generalEmbed);
    }

    async sendLog(message, target) {

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate('redStarLogs').exec();

        let mentionedName = message.guild.member(target).nickname
        if (!mentionedName) mentionedName = target.username

        let generalEmbed = new Discord.MessageEmbed()
            .setTitle(`${mentionedName} Red Stars General Summary in ${corp.name}:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server, Joined includes Created. (Filled/Timeout)`)
            .setColor("GREEN")
            .setFooter(`You can see top players by doing &rslog top !`)


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
        return message.channel.send(generalEmbed);
    }
    async sendTopLog(message) {

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate('redStarLogs').exec();

        let generalEmbed = new Discord.MessageEmbed()
            .setTitle(`${corp.name} Red Stars Top 5 Players:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server, Joined includes Created.`)
            .setColor("GREEN")
            .setFooter(`You can see general information with &rslog or &rslog total`)

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

        return message.channel.send(generalEmbed);
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
    }

}
