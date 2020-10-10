import { Manager } from '../../../lib';

export class SippingManager extends Manager{
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
        if(message.content.includes(`*sip`) || message.content.includes(`_sip`))
		{	
			let amountOfReplies = 7
			var randomnumber = Math.floor(Math.random() * (amountOfReplies)) ;
			let stringsArray = ["*sips back*",
			`https://cdn.discordapp.com/attachments/715912745157001277/760132360397520966/lindsey-wakefield-sketch-dragon-drinking-tea-by-lindseywart-d9untoc.png`,	
			`https://cdn.discordapp.com/attachments/715912745157001277/760132361861070918/e7c81de15eae7503d18d0147df4d0b33.png`,
			`https://cdn.discordapp.com/attachments/715912745157001277/760132389035835452/114o50.png`,
			`*casually sips back*`,
		`https://i.pinimg.com/originals/9f/a0/f4/9fa0f45178d417d2e102d6c09fd24362.jpg`,
		`https://i.pinimg.com/236x/c0/8e/08/c08e0816cc2e093bc914345d1f879f08--coffee-pics-coffee-coffee.jpg`,

	]
			message.channel.send(stringsArray[randomnumber])
	
		}
    }

    disable(){
        if(this.enabled){

        }
        super.disable();
    }
}