import { MemberCommand } from './MemberCommand';
import { RedStarRoles, Corp, RedStarLog } from '../../database'
const { MessageButton, MessageActionRow } = require("discord-buttons")
const Discord = require('discord.js');
import Mongoose from 'mongoose'

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

        let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').populate('redStarLogs').exec();

        if (message.mentions.users.first()) {
            this.sendLog(message, message.mentions.users.first(), corp); //Send recuit message
        }
        else if (args[0] == "top") {
            this.sendTopLog(message, corp); //Send recuit message
        }
        else if (args[0] == "last") {
            this.sendLastLog(message, corp); //Send recuit message

        } else {
            this.sendGeneralLog(message, corp); //Send recuit message
        }
    }

    async sendGeneralLog(message, corp) {


        let generalEmbed = new Discord.MessageEmbed()
            .setTitle(`${corp.name} Red Stars General Summary:`)
            .setThumbnail("https://i.imgur.com/hedXFRd.png")
            .setDescription(`This information are from closed queues in the corp server. (Filled/Timeout)`)
            .setColor("GREEN")
            .setFooter(`You can mantion a player to see his specific stats in the corp!`)


        //Get Last Month
        let d = new Date()
        let checkDate = new Date(d.setMonth(d.getMonth() - 1))

        let totalTimeout = corp.redStarLogs.filter(log => log.endStatus == "Timeout")
        let totalSucceeded = corp.redStarLogs.filter(log => log.endStatus == "Succeeded")
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

    async sendLog(message, target, corp) {

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

        let totalCreatorTimeout = corp.redStarLogs.filter(log => log.endStatus == "Timeout" && log.creatorId == target.id).length
        let totalCreatorSucceeded = corp.redStarLogs.filter(log => log.endStatus == "Succeeded" && log.creatorId == target.id).length
        let monthlyCreatorTimeout = corp.redStarLogs.filter(log => (log.endStatus == "Timeout" && log.creatorId == target.id && (log.timeClosed > checkDate))).length
        let monthyCreatorSucceeded = corp.redStarLogs.filter(log => (log.endStatus == "Succeeded" && log.creatorId == target.id && (log.timeClosed > checkDate))).length

        //Total Created
        let totalStr = `__Succeeded:__ ${totalCreatorSucceeded}    (${monthyCreatorSucceeded} this month)\n`
        totalStr += `__Timeout:__ ${totalCreatorTimeout}   (${monthlyCreatorTimeout} this month)\n`
        generalEmbed.addField("Total Created", totalStr)

        //Total Joined

        let totalJoinedTimeout = corp.redStarLogs.filter(log => log.endStatus == "Timeout" && log.membersIds.includes(target.id)).length
        let totalJoinedSucceeded = corp.redStarLogs.filter(log => log.endStatus == "Succeeded" && log.membersIds.includes(target.id)).length
        let monthlyJoinedTimeout = corp.redStarLogs.filter(log => (log.endStatus == "Timeout" && log.membersIds.includes(target.id) && (log.timeClosed > checkDate))).length
        let monthyJoinedSucceeded = corp.redStarLogs.filter(log => (log.endStatus == "Succeeded" && log.membersIds.includes(target.id) && (log.timeClosed > checkDate))).length

        let totalJoinedStr = `__Succeeded:__ ${totalJoinedSucceeded}    (${monthyJoinedSucceeded} this month)\n`
        totalJoinedStr += `__Timeout:__ ${totalJoinedTimeout}   (${monthlyJoinedTimeout} this month)\n`

        generalEmbed.addField("Total Joined", totalJoinedStr)
        return message.channel.send(generalEmbed);
    }
    async sendTopLog(message, corp) {

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
 
        corp.redStarLogs.filter(log => log.endStatus == "Succeeded" && (log.timeClosed > checkDate)).forEach(log => {
            if (!playerMonthlyCreated.get(log.creatorId))
                playerMonthlyCreated.set(log.creatorId, 1)
            else
                playerMonthlyCreated.set(log.creatorId, playerMonthlyCreated.get(log.creatorId) + 1)

            log.membersIds.forEach(m => {
                if (!playerMonthlyJoined.get(m))
                    playerMonthlyJoined.set(m, 1)
                else
                    playerMonthlyJoined.set(m, playerMonthlyJoined.get(m) + 1)
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
       
        corp.redStarLogs.filter(log => log.endStatus == "Succeeded").forEach(log => {
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

        let strTotal = "**Created Successfully**\n"
        strTotal += await this.getTop5StringFromMap(message, playerTotalCreated)
        strTotal += "**Joined Sucessfully**\n"
        strTotal += await this.getTop5StringFromMap(message, playerTotalJoined)
        generalEmbed.addField("Total:", strTotal)

        return message.channel.send(generalEmbed);
    }




    async sendLastLog(message, corp) {
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
