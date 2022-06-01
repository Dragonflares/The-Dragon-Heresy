import { MemberCommand } from './MemberCommand';
import { Member, ShipyardLevels } from '../../database';
import Mongoose from 'mongoose'
import { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu} from 'discord.js';

export class SetShipyardLevelCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'setshipyardlevel',
            aliases: ['ssyl','shipyard'],
            description: "Changes your shipyard levels.",
            usage: "&ssyl"
        });
    }

    async run(message, args) {
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.author
        }
        else if (message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's Red Star Level!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate("shipyardLevels").exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")
        else {
            if (member.Corp.corpId === message.guild.id.toString())
                return this.modifyLevels(member, message)

            return message.channel.send("You aren't on your Corporation's server!");
        }
    }
    
    modifyLevels = async (target, message) => { 
         let newbsLevel = 1
         let newminerLevel = 1
         let newtpsLevel = 1

        if (target.shipyardLevels) {
            newbsLevel= target.shipyardLevels.battleshiplevel
            newminerLevel= target.shipyardLevels.minerlevel
            newtpsLevel= target.shipyardLevels.transportlevel
        }

        let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "going")

        //BattleShips Level
        let selectBSLevel = new MessageSelectMenu()
            .setCustomId('bslevels')
            .setPlaceholder('Battleships Level')

        for (let i = 1; i < 7; i++) {
            selectBSLevel.addOptions([
                {
                label: `Level ${i}`,
                value: `${i}`,
                }
            ])
        }
        //End Battleships level

        //Miners Level
        let selectMinersLevel = new MessageSelectMenu()
            .setCustomId('mslevels')
            .setPlaceholder('Miners Level')

        for (let i = 1; i < 7; i++) {
            selectMinersLevel.addOptions([
                {
                label: `Level ${i}`,
                value: `${i}`,
                }
            ])
        }
        //End Miner Level

        //Transports Level
        let selectTransportsLevel = new MessageSelectMenu()
            .setCustomId('tpslevels')
            .setPlaceholder('Transports Level')

        for (let i = 1; i < 7; i++) {
            selectTransportsLevel.addOptions([
                {
                label: `Level ${i}`,
                value: `${i}`,
                }
            ])
        }

        //End Transports level

        //Buttons
        let acceptButton = new MessageButton()
            .setStyle(3)
            .setLabel('Accept')
            .setCustomId('Accept')

        let cancelButton = new MessageButton()
            .setStyle(4)
            .setLabel('Cancel')
            .setCustomId('Cancel')

        //End buttons

        //Rows
        let firstRow = new MessageActionRow()
        firstRow.addComponents(selectBSLevel)
        let secondRow = new MessageActionRow()
        secondRow.addComponents(selectMinersLevel)
        let thirdRow = new MessageActionRow()
        thirdRow.addComponents(selectTransportsLevel)
        let buttonRow = new MessageActionRow()
        buttonRow.addComponents(acceptButton);
        buttonRow.addComponents(cancelButton);
        //End Rows


        let messageReaction = await message.channel.send({embeds:[embed], components: [firstRow, secondRow, thirdRow, buttonRow] });

        const filter = (button) => button.user.bot == false;
        const collector = messageReaction.createMessageComponentCollector({filter, time: 2 * 60 * 1000});

        //Menu Collector
        collector.on('collect', async b => {
            b.deferUpdate()
            if (b.user.id == message.author.id) {
                if (b.customId == "bslevels") {
                    newbsLevel = b.values[0]
                } else if (b.customId == "mslevels") {
                    newminerLevel = b.values[0]
                }
                else if (b.customId == "tpslevels") {
                    newtpsLevel = b.values[0]
                }
                //console.log(b)
                if (b.customId == "tpslevels" || b.customId == "mslevels" || b.customId == "bslevels"){
                    let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "going")
                    messageReaction.edit({embeds:[embed]})
                }
                if (b.customId == "Accept") {

                    if (!target.shipyardLevels) {
                        let newShipyardLevels = new ShipyardLevels({
                            _id: new Mongoose.Types.ObjectId(),
                            battleshiplevel: newbsLevel,
                            minerlevel: newminerLevel,
                            transportlevel: newtpsLevel
                        })
                        target.shipyardLevels = newShipyardLevels

                    } else {
                        target.shipyardLevels.battleshiplevel = newbsLevel,
                            target.shipyardLevels.minerlevel = newminerLevel,
                            target.shipyardLevels.transportlevel = newtpsLevel
                    }
                    await target.shipyardLevels.save();
                    await target.save();

                    let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "done")
                    messageReaction.edit({ components: [], embeds: [embed] });
                }else if (b.customId == "Cancel") {
                    let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "cancel")
                    embed.setColor("RED")
                    messageReaction.edit({ components: [], embeds: [embed] });
                }
            }

        });

        collector.on('end', async collected => {
            let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "cancel")
            embed.setColor("RED")
            messageReaction.edit({ components: [], embeds: [embed] });
        });

    }

    async GetLevelsMessage(member, newbsLevel, newminerLevel, newtpsLevel, status) {



        let embed = new MessageEmbed()//

        if (status == "going") {
            embed.setColor("ORANGE")
            if (member.shipyardLevels) {
                embed.addField('*Battleships Level*', `__Current__: ${member.shipyardLevels.battleshiplevel}  __New__: ${newbsLevel}`);
                embed.addField('*Miners Level*', `__Current__: ${member.shipyardLevels.minerlevel}  __New__: ${newminerLevel}`);
                embed.addField('*Transports Level*', `__Current__: ${member.shipyardLevels.transportlevel}  __New__: ${newtpsLevel}`);
            } else {
                embed.addField('*Battleships Level*', `__Current__: 1  __New__: ${newbsLevel}`);
                embed.addField('*Miners Level*', `__Current__: 1  __New__: ${newminerLevel}`);
                embed.addField('*Transports Level*', `__Current__: 1  __New__: ${newtpsLevel}`);
            }
        } else if (status == "cancel") {
            embed.setColor("RED")
            if (member.shipyardLevels) {
                embed.addField('*Battleships Level*', `${member.shipyardLevels.battleshiplevel}`);
                embed.addField('*Miners Level*', `${member.shipyardLevels.minerlevel} `);
                embed.addField('*Transports Level*', `${member.shipyardLevels.transportlevel}  `);
            } else {
                embed.addField('*Battleships Level*', `1`);
                embed.addField('*Miners Level*', `1`);
                embed.addField('*Transports Level*', `1`);
            }
        } else {
            embed.setColor("GREEN")
            if (member.shipyardLevels) {
                embed.addField('*Battleships Level*', `${member.shipyardLevels.battleshiplevel}`);
                embed.addField('*Miners Level*', `${member.shipyardLevels.minerlevel}`);
                embed.addField('*Transports Level*', `${member.shipyardLevels.transportlevel}`);
            } else {
                embed.addField('*Battleships Level*', `1`);
                embed.addField('*Miners Level*', `1`);
                embed.addField('*Transports Level*', `1`);
            }
        }
        embed.setTitle(`**Shipyard Levels**`);
        // embed.setThumbnail("https://i.imgur.com/fNtJDNz.png")
        embed.setDescription("Player shipyard levels.")

        return embed
    }
}