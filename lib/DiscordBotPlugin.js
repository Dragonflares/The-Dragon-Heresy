import { EventEmitter } from 'events';

/**
 * Base class for Discord plugins 
 * Discord plugins are used to customize the behavior of the discord bot
 *
 * @extends EventEmitter
 */
export class DiscordBotPlugin extends EventEmitter{
	constructor(bot){
		super();
		this.bot = bot;

		this._dependencies = new Set();
		this._commands 	   = new Set();
		this._enabled 	   = false;
	}

	get name(){
		return this.constructor.name;
	}

	/**
	 * The module priority, the higher, the strongest. Default is 0
	 * 
 	 * @type {number}
	 */
	get priority(){
		return 0;
	}

	/**
	 * Enables or disable the plugin
	 * 
 	 * @type {boolean}
	 */
	get enabled(){ return this._enabled }
	set enabled(enabled){
		enabled ? this.enable() : this.disable();
	}

	/**
	 * The dependencies Set object. It is used to validate the use of a plugin when it depends on another plugin.
	 * 
 	 * @return {Map} the dependency Map
	 */
	get dependencies(){
		return this._dependencies;
	}
	
	/**
	 * Test the validity of the Module. It checks that the dependencies exists in the bootstrap.
	 * 
 	 * @return {boolean} true if the current plugin is runnable 
	 */
	get runnable(){
		return this.enabled && Array.from(this.dependencies).every(dependency => this.bootstrap.modules.has(dependency));
	}

	/**
	 * The commands this plugins exposes
	 * 
 	 * @return {Set} the command Set
	 */
	get commands(){
		return this._commands;
	}

	/**
	 * Enables the plugin
	 */
	enable(){
		if(!this.enabled){
			console.log(`Enabling plugin [${this.name}]`)

			this.commands.forEach(commandClass => {
				const command = new commandClass(this);

				console.log(`Registering command [${command.constructor.name}]`)

				// Add main name
				if(!this.bot.commands.has(command.name))
					this.bot.commands.set(command.name, command);
				else console.warn(`Duplicate command name ${command.name} [${command.constructor.name} in ${this.name}]`);

				// Add aliases
				command.aliases.forEach(alias => {
					if(!this.bot.commands.has(command.name))
						this.bot.commands.set(alias, command)
					else console.warn(`Duplicate command alias ${alias} [${command.constructor.name} in ${this.name}]`);
				});
			});

			this._enabled = true;
		}
	}

	/**
	 * Disables the plugin
	 */
	disable(){
		if(this.enabled){
			this._enabled = false;	

			this.commands.forEach(commandClass => {
				const command = new commandClass(this);

				// Remove main name
				this.bot.commands.delete(command.name);

				// Remove aliases
				command.aliases.forEach(alias => this.bot.commands.delete(alias));
			});	
		}
	}
}