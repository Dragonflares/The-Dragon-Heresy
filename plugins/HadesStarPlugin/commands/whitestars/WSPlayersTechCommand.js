import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Tech, Corp } from '../../database';
import { TechTree } from '../../techs';
import * as WsUtils from '../../utils/whiteStarsUtils.js';
import { confirmResultButtons } from '../../utils';
import { MessageEmbed } from 'discord.js';

export class WSPlayersTechCommand extends WhitestarsCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'wsplayerstech',
            aliases: ['wspt'],
            description: "Summary of Whitestar Members",
            usage: "&wsplayerstech <wsrole>"
        });
    }

    async run(message, args) {
        let user = message.author
        let roles = message.mentions.roles.first()
        let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            if (!roles) {
                let roleName = await confirmResultButtons(message, args.join(' '), message.guild.roles.cache.map(a => a.name))
                if (!roleName) return;
                roles = message.guild.roles.cache.find(r => r.name === roleName);
            }

            if (member.Corp.corpId === message.guild.id.toString())
                return this.summaryAll(message, roles)
            else
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }



    summaryAll = async (message, role) => {
        message.delete({ timeout: 1 });    //Delete User message
        const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate({ 
            path: 'members',
            populate: [{
             path: 'techs',
             model: 'Tech'
            }] 
         }).exec()
        if(!ws) return;
        this.summaryMessage(message, ws, "Weapons And Shields")
        this.summaryMessage(message, ws, "Support")
        this.summaryMessage(message, ws, "Mining")
        this.summaryMessage(message, ws, "Economics")
    }

    summaryMessage = async (message, ws, cat) => {
        let techsCategories = new Map([
            ["Weapons And Shields", ['Battery','Laser','MassBattery','DualLaser','Barrage','DeltaShield','OmegaShield','BlastShield']],
            ["Support", ['EMP','Teleport','RemoteRepair','TimeWarp','Unity',
                         'Fortify','AlphaRocket','Suppress','Destiny','Barrier',
                         'DeltaRocket','Leap','OmegaRocket']],
            ["Mining", ['MiningBoost','Enrich','RemoteMining','MiningUnity','Crunch','Genesis']],
            ["Economics", ['Dispatch','RelicDrone']]
        ])
        //Create Message
        let summaryEmbed = new MessageEmbed()
            .setTitle(`Summary of whitestar members ${cat} techs:`)
            .setThumbnail("https://i.imgur.com/fNtJDNz.png")
            .addField("Group:", `<@&${ws.wsrole}>`, true)

        //await Promise.all(Array.from(TechTree.technologies.values()).map(async tech => {

        await Promise.all(techsCategories.get(cat).map( async tech => {
            let members = ws.members
            let memListSorted = await Promise.all(
                members.map(async t => [t, await this.GetModule(t, tech)])
            )

            // console.log(memListSorted)
            memListSorted = memListSorted
                .filter(([key, value]) => value != null)
                .map(([key, value]) => [value.level, key.name])
                .filter(([key, value]) => key > 0)
                .sort(([keya, valuea], [keyb, valueb]) => keya < keyb ? 1 : -1)
                .map(([key, value]) => `${value} ${key}`)
                .join('\n');
                //.slice(0, 5)
                

            if (memListSorted)
                summaryEmbed.addField(tech.replace(/([A-Z])/g, ' $1').trim(), memListSorted, true)
        }));
        return message.channel.send({embeds:[summaryEmbed]})
    }
    async GetModule(member, techName) {
        let techFound;
        let techs = await Tech.find({ _id: Array.from(member.techs) })

        techs.map(t => {
            if (t.name == techName) techFound = t;
        })
        return techFound
    }
}