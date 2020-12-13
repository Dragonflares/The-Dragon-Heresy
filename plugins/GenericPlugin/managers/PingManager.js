import { Manager } from '../../../lib';

export class PingManager extends Manager{
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
        if(message.mentions.has( this.client.user))
		{	
			message.channel.send("Please, refrain from pinging me. I am busy!")
	
        }
        //Me and Boom
        else if(message.mentions.has('153558944478920704') || message.mentions.has('236891878690258944'))
		{	
			message.channel.send("Hope its important, or he might get angry!")
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}