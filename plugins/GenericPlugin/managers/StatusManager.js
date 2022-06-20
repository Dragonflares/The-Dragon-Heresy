import { Manager } from '../../../lib';

export class StatusManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.user.setPresence(
                { 
                    activities: [
                        { 
                            name: "&help" , 
                            type: 'LISTENING' 
                        }
                    ], 
                    status: "online" // online, idle, invisible, dnd
                }
            ) 
        }   
        super.enable();
    }

    disable() {
        if (this.enabled) {
        }
        super.disable();
    }
}