import { Manager } from '../../../lib';

export class BeerManager extends Manager{
    constructor(plugin){
        super(plugin);
    }

    enable(){
        if(!this.enabled){
            this.client.on('message', async message => this.myListener(message))
        }
        super.enable();
    }

    myListener = (message) => {
        if(message.content.includes(`🍺`) || message.content.includes(`🍻`))
        {
			message.react(`🍻`);
	
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}