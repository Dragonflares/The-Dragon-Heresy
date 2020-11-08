import { Manager } from '../../../lib';

export class CachingManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.on('raw', async packet => {
                if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
                const channel = await this.client.channels.fetch(packet.d.channel_id);
                let user = await this.client.users.fetch(packet.d.user_id)
                if (channel.messages.cache.has(packet.d.message_id)) return;
                channel.messages.fetch(packet.d.message_id).then(async message => {
                    const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                    const reaction = message.reactions.cache.get(emoji);
                    if (reaction) reaction.users.cache.set(packet.d.user_id, user);
                    if (packet.t === 'MESSAGE_REACTION_ADD') {
                        this.client.emit('messageReactionAdd', reaction, user);
                    }
                    if (packet.t === 'MESSAGE_REACTION_REMOVE') {
                        this.client.emit('messageReactionRemove', reaction, user);
                    }
                });
            });

        }
        super.enable();
    }


    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}