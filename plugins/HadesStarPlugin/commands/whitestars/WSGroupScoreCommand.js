import { WhitestarsCommand } from './WhitestarsCommand';
import { Member, WhiteStar, Corp } from '../../database';
import { confirmResultButtons } from '../../utils';
import { MessageEmbed } from 'discord.js';
import { TechTree } from '../../techs';

export class WSGroupScoreCommand extends WhitestarsCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'wsgroupscore',
            aliases: ['wsgs'],
            description: "Checks Whitestar group scores.",
            usage: "&wsgs <wsrole>"
        });
    }
    async run(message, args) {
        let user = message.author
        let roles = message.mentions.roles.first()
        let member = await Member.findOne({ discordId: user.id.toString() }).populate('Corp').populate('techs').populate("shipyardLevels").exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            if (!roles) {
                let allRoles = message.guild.roles.cache.map(a => a.name)
                allRoles = allRoles.filter(function (item) {
                    return item !== "@everyone"
                })

                let roleName = await confirmResultButtons(message, args.join(' '), allRoles)
                if (!roleName) return;
                roles = message.guild.roles.cache.find(r => r.name === roleName);
            }
            if (member.Corp.corpId === message.guild.id.toString())
                return this.scoreMessage(message, roles, member)
            else
                return message.channel.send("You aren't on your Corporation's server!")
        }
    }

    scoreMessage = async (message, role, member) => {
        message.delete({ timeout: 1 });    //Delete User message

        //Get Whitestart with role
        const ws = await WhiteStar.findOne({ wsrole: role.id }).populate('author').populate('members').populate({ 
            path: 'members',
            populate: [{
             path: 'techs',
             model: 'Tech'
            }] 
         }).exec()
        if (ws) {
            let embed = new MessageEmbed().setColor("RANDOM");
            embed.setTitle(`**WS Group Score**`);

            let total = 0
            let membersArr = ``
            //loop players
            await Promise.all(Array.from(ws.members).map(async t => {
                let member = await Member.findOne({ discordId: t.discordId }).populate("Corp").populate('techs').populate("shipyardLevels").exec();
                const memberTechsArray = member.techs.filter(t => t.level > 0).sort((a, b) => a.name > b.name ? 1 : -1);
                let totalScore = 0
                if (memberTechsArray.length) {

                    const memberTechs = new Map(memberTechsArray.map(t => [t.name, t]));

                    const temp = [...TechTree.categories.values()]
                        .filter(category => memberTechsArray.some(t => category.has(t.name)))
                        .sort((a, b) => a.name > b.name ? 1 : -1)
                        .map(category => [
                            `*${category.name}*`,
                            Array.from(category.get().values())
                                .filter(t => memberTechs.has(t.name))
                                .map(t => {
                                    let wsscore = TechTree.find(t.name).properties.get('WS Score')[memberTechs.get(t.name).level - 1];
                                    totalScore += parseInt(wsscore);
                                    return ``
                                })
                        ])

                    let bslevel = 1
                    let minerlevel = 1
                    let tpslevel = 1
                    if (member.shipyardLevels) {
                        bslevel = member.shipyardLevels.battleshiplevel
                        minerlevel = member.shipyardLevels.minerlevel
                        tpslevel = member.shipyardLevels.transportlevel
                    }

                    //scores
                    let bsScores = [0, 1, 500, 2000, 4000, 7000, 8000]
                    let msScores = [0, 1, 500, 1000, 2000, 4000, 8000]
                    let tpsScores = [0, 1, 500, 1000, 1500, 2000, 2200]

                    totalScore += bsScores[bslevel]
                    totalScore += msScores[minerlevel]
                    totalScore += tpsScores[tpslevel]


                }
                membersArr += `${member.name}: ${totalScore}\n`
                total += totalScore;
            }));

            embed.addField("Group", `<@&${ws.wsrole}>`)
            embed.addField("Members", `${membersArr}`)
            embed.addField("Total", `Score: ${total}`)

            return message.channel.send({embeds:[embed]})
        } else {
            return message.channel.send(`There is currently not a whitestar running with that role.`)
        }
    }
}

