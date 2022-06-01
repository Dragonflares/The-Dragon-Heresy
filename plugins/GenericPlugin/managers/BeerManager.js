import { Manager } from '../../../lib';

export class BeerManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.on('messageCreate', async message => this.beerListener(message))
        }
        super.enable();
    }

    beerListener = (message) => {
        if (message.content.includes(`🍺`) || message.content.includes(`🍻`)) {
            message.react(`🍻`);
        } else if (message.content.includes(`🧃`)) {
            message.react(`🧃`);
        }
    }

    disable() {
        if (this.enabled) {
        }
        super.disable();
    }
}