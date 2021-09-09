import { Manager } from '../../../lib';
import { randomInt } from './../../HadesStarPlugin/utils/randomInt';

const replies = [
    "I'm terribly sorry, but I can't really give you a proper response as of now.",
    "Could you please try and avoid tagging me?",
    "Nice, another message ping I need to get rid of.",
    "If you got any questions, please ask my devs, I can't really help you.",
    "Come on, do it one more time.",
    "Keep poking and I'll have some dinner, now take a guess on who that might be.",
    "'Be a discord bot' they said, 'they won't bother you too much' they said."
];

const pencolReplies = [
    "The ban-hammer is ready, hope it was worth it!",
    "Let the man sleep! He is lazy right now.",
    "The wrath of the sleeping Pencol is arriving!",
    "Meh, You can try to ping all you want... wont help."
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
            message.channel.send(pencolReplies[randomInt(0, pencolReplies.length - 1)])
        }
  
        else if(message.mentions.has('236891878690258944') && this.client.users.cache.find(u=> u.id == "236891878690258944").presence.status == "offline")
		{	
			message.channel.send("You had better hope that ping was important... He is a grumpy cop..")
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}