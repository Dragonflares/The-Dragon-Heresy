import { Manager } from '../../../lib';

export class LargerManager extends Manager{
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
        if(message.content.startsWith("&ut ")|| message.content.startsWith("&updatetech "))
        {
			message.react(`👏`);
	
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}