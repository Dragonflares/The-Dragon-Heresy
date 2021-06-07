import { Manager } from '../../../lib';
import { Member, RedStarMessage, RedStarRoles, Corp } from '../database';

export class RedStarRolesMessageManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.on('messageReactionAdd', async (messageReaction, user) => this.reactListener(messageReaction, user))
        }
        super.enable();
    }

    reactListener = async (messageReaction, user) => {
        if (user.bot) return;
        const corp = await Corp.findOne({ corpId: messageReaction.message.guild.id.toString() }).populate('redStarMessage').exec()
        if(!corp.redStarMessage){}
        else if (messageReaction.message.id == corp.redStarMessage.rolesMessage) {
            let message = messageReaction.message;
            messageReaction.users.remove(user); // Remove it

            let level = 99
            let reactionsIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '‼️']
            if (reactionsIcons.includes(messageReaction.emoji.name)) level = reactionsIcons.indexOf(messageReaction.emoji.name) + 1

            if (level != 99) {
                let existentRedStarRoles = await RedStarRoles.findOne({ corpId: message.guild.id.toString() })
                let role = existentRedStarRoles.redStarRoles.get(`${level}`)
                let roleMember = await message.guild.members.fetch(user.id)
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