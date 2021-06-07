import { Manager } from '../../../lib';
import { randomInt } from './randomInt';

const replies = [
    "I'm terribly sorry, but I can't really give you a proper response as of now.",
    "Could you please try and avoid tagging me?",
    "Nice, another message ping I need to get rid of.",
    "If you got any questions, please ask my devs, I can't really help you.",
    "Come on, do it one more time.",
    "Keep poking and I'll have some dinner, now take a guess on who that might be.",
    "'Be a discord bot' they said, 'they won't bother you too much' they said."
];

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
        if(message.author.bot) return;
        if(message.mentions.has( this.client.user))
		{	
			message.channel.send(replies[randomInt(0, replies.length - 1)])
	
        }
        //Me and Boom
        else if(message.mentions.has('153558944478920704') && this.client.users.cache.find(u=> u.id == "153558944478920704").presence.status == "offline") {
            message.channel.send("The ban-hammer is ready, hope it was worth it!")
        }
  
        else if(message.mentions.has('236891878690258944') && this.client.users.cache.find(u=> u.id == "236891878690258944").presence.status == "offline")
		{	
			message.channel.send("You had better hope that ping was important... He's grumpy..")
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}