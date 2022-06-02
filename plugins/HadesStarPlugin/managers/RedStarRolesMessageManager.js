import { Manager } from '../../../lib';
import { Member, RedStarMessage, Corp } from '../database';
import * as RoleMessageUtils from '../utils/roleMessageUtils'

export class RedStarRolesMessageManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.reListen()
            this.client.on('interactionCreate', async (interaction) => this.reactChosen(interaction))
        }
        super.enable();
    }
    reListen = async () => {
        const guilds = this.client.guilds.cache.map(guild => guild.id);
        guilds.forEach(async guild => {
            const corp = await Corp.findOne({ corpId: guild.toString() }).populate('redStarMessage').exec()
            let redStarMessage = corp.redStarMessage
            //Fetch recruit message
            let messageReaction = await this.client.channels.cache.get(redStarMessage.rolesMessageChannel).messages.fetch(redStarMessage.rolesMessage);
            RoleMessageUtils.collectorFunc(this.client, messageReaction)
        });
    }

    reactChosen = async (interaction) => {
        if (interaction.customId == "setRslevel") {
            const corp = await Corp.findOne({ corpId: interaction.guild.id.toString() }).populate("redStarRoles").exec()

            //get user
            const members = await interaction.guild.members.fetch();
            let author
            await members.forEach(member => {
                if (member.id === interaction.user.id) {
                    author = member
                }
            })
            let AuthorRoles = author.roles.cache.map(role => role.id)
            //remove all rs roles
            for (let i = 1; i < 12; i++) {
                if(AuthorRoles.includes(corp.redStarRoles.redStarRoles.get(i.toString())))
                    author.roles.remove(corp.redStarRoles.redStarRoles.get(i.toString()))
            }
            //add new roles
            interaction.values.forEach( role =>{
                author.roles.add(corp.redStarRoles.redStarRoles.get(role.toString()))
            })

            await interaction.update({ content: 'Done!', components: [] });
        }
    }

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}