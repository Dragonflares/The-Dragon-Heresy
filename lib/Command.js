export class Command {
	constructor(plugin, {
		name 		= "UndefinedCommand",
		aliases 	= [],
	    description = "No description",
	    usage 		= "&undefinedcommand",
	} = {}){

		this.plugin 		= plugin;
		this.name 	 		= name;
		this.aliases 	 	= aliases;
		this.description 	= description;
		this.usage 			= usage;
	}

	get bot(){
		return this.plugin.bot;
	}

	get client(){
		return this.bot.client;
	}

	async run(){

	}
}