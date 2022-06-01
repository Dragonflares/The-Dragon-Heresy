import { Manager } from '../../../lib';

export class LargerManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.on('messageCreate', async message => this.largerListener(message))
        }
        super.enable();
    }

    largerListener = (message) => {
        if (message.content.startsWith("&ut ") || message.content.startsWith("&updatetech ")) {
            message.react(`👏`);
        }
    }

    disable() {
        if (this.enabled) {
        }
        super.disable();
    }
}