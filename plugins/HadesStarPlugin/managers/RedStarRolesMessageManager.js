import { Manager } from '../../../lib';
import { Member, RedStarMessage, RedStarRoles, Corp } from '../database';

export class RedStarRolesMessageManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.cacher();
            this.client.on('messageReactionAdd', async (messageReaction, user) => this.reactListener(messageReaction, user))
        }
        super.enable();
    }

    cacher = async () => {
        console.log(`[RSRolesMessageManager] INFO: Starting`)
        this.client.guilds.cache.forEach(async t => {
            const corp = await Corp.findOne({ corpId: t.id.toString() }).populate('redStarMessage').exec()
            if (corp) {
                if (corp.redStarMessage) {
                        this.client.channels.cache.get(corp.redStarMessage.rolesMessageChannel).messages.fetch(corp.redStarMessage.rolesMessage.toString());
                        console.log(`[RSRolesMessageManager] INFO: Registering for corp ${Corp.name} done`)
                } else {
                    console.log("[RSRolesMessageManager] INFO:  Please add roles message")
                }
            } else {
                console.log("[RSRolesMessageManager] INFO:  Corp Error")
            }
        });

    }

    reactListener = async (messageReaction, user) => {
        if(user.bot)return;
        const corp = await Corp.findOne({ corpId: messageReaction.message.guild.id.toString() }).populate('redStarMessage').exec()
        if(messageReaction.message.id == corp.redStarMessage.rolesMessage)
        {
            let message = messageReaction.message;
            messageReaction.users.remove(user); // Remove it

            let level = 99
            let reactionsIcons = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','‼️']
            if(reactionsIcons.includes(messageReaction.emoji.name)) level = reactionsIcons.indexOf(messageReaction.emoji.name)+1

            if (level != 99) {
                let existentRedStarRoles = await RedStarRoles.findOne({ corpId: message.guild.id.toString() })
                let role = existentRedStarRoles.redStarRoles.get(`${level}`)
                let roleMember = message.guild.members.cache.find(r => r.id == user.id)
                if (roleMember.roles.cache.find(r => r.id === role))
                    roleMember.roles.remove(role)
                else
                    roleMember.roles.add(role)
            }
        }
          
    }

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}