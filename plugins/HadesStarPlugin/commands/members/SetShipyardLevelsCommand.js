import { MemberCommand } from './MemberCommand';
import { Member, ShipyardLevels } from '../../database';
import { MessageEmbed } from 'discord.js';
import Mongoose from 'mongoose'

const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require("discord-buttons")

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
            target = message.guild.member(message.author)
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
        /* Member.findOneAndUpdate({discordId: target.id.toString()}, {rslevel: NewRSLevel})
         .catch(err => console.log(err))
         return message.channel.send(`Red Star level updated.`)*/
  
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
        let selectBSLevel = new MessageMenu()
            .setID('bslevels')
            .setPlaceholder('Battleships Level')
            .setMaxValues(1)
            .setMinValues(1)

        for (let i = 1; i < 7; i++) {
            let option = new MessageMenuOption()
                .setLabel(`Level ${i}`)
                .setValue(i)
            selectBSLevel.addOption(option)
        }
        //End Battleships level

        //Miners Level
        let selectMinersLevel = new MessageMenu()
            .setID('mslevels')
            .setPlaceholder('Miners Level')
            .setMaxValues(1)
            .setMinValues(1)

        for (let i = 1; i < 7; i++) {
            let option = new MessageMenuOption()
                .setLabel(`Level ${i}`)
                .setValue(i)
            selectMinersLevel.addOption(option)
        }
        //End Miner Level

        //Transports Level
        let selectTransportsLevel = new MessageMenu()
            .setID('tpslevels')
            .setPlaceholder('Transports Level')
            .setMaxValues(1)
            .setMinValues(1)

        for (let i = 1; i < 7; i++) {
            let option = new MessageMenuOption()
                .setLabel(`Level ${i}`)
                .setValue(i)
            selectTransportsLevel.addOption(option)
        }

        //End Transports level

        //Buttons
        let acceptButton = new MessageButton()
            .setStyle('red')
            .setLabel('Accept')
            .setID('Accept')

        let cancelButton = new MessageButton()
            .setStyle('grey')
            .setLabel('Cancel')
            .setID('Cancel')

        //End buttons

        //Rows
        let firstRow = new MessageActionRow()
        firstRow.addComponent(selectBSLevel)
        let secondRow = new MessageActionRow()
        secondRow.addComponent(selectMinersLevel)
        let thirdRow = new MessageActionRow()
        thirdRow.addComponent(selectTransportsLevel)
        let buttonRow = new MessageActionRow()
        buttonRow.addComponent(acceptButton);
        buttonRow.addComponent(cancelButton);
        //End Rows


        let messageReaction = await message.channel.send(embed, { components: [firstRow, secondRow, thirdRow, buttonRow] });

        const filter = (button) => button.clicker.user.bot == false;
        const collector = messageReaction.createMenuCollector(filter, { time: 2 * 60 * 1000, dispose: true });
        const collectorBtn = messageReaction.createButtonCollector(filter, { time: 2 * 60 * 1000, dispose: true });

        //Menu Collector
        collector.on('collect', async b => {
            b.reply.defer()
            if (b.clicker.id == message.author.id) {
                if (b.id == "bslevels") {
                    newbsLevel = b.values[0]
                } else if (b.id == "mslevels") {
                    newminerLevel = b.values[0]
                }
                else if (b.id == "tpslevels") {
                    newtpsLevel = b.values[0]
                }
                //console.log(b)

                let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "going")
                messageReaction.edit(embed)
            }

        });
        collector.on('end', async collected => {
            let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "cancel")
            messageReaction.edit({ component: null, embed: embed });
        });

        //Button Collector
        collectorBtn.on('collect', async b => {
            b.reply.defer()
            if (b.clicker.id == message.author.id) {
                if (b.id == "Accept") {

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
                    messageReaction.edit({ component: null, embed: embed });
                }

                if (b.id == "Cancel") {
                    let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "cancel")
                    messageReaction.edit({ component: null, embed: embed });
                }
            }
        })

        collector.on('end', async collected => {
            let embed = await this.GetLevelsMessage(target, newbsLevel, newminerLevel, newtpsLevel, "cancel")
            messageReaction.edit({ component: null, embed: embed });
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