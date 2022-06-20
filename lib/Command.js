export class Command {
	constructor(plugin, {
		name 		= "UndefinedCommand",
		aliases 	= [],
	    description = "No description",
	    usage 		= "&undefinedcommand",
	    category 	= "default",
	    subcategory = "default",
		hidden		= false
	} = {}){

		this.plugin 		= plugin;
		this.name 	 		= name;
		this.category 	 	= category;
		this.subcategory 	= subcategory;
		this.aliases 	 	= aliases;
		this.description 	= description;
		this.usage 			= usage;
		this.hidden			= hidden;
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