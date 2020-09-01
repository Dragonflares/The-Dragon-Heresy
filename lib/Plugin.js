import { EventEmitter } from 'events';
import { flatten } from 'array-flatten';
import { Command } from './Command';

/**
 * Base class for Discord plugins 
 * Discord plugins are used to customize the behavior of the discord bot
 *
 * @extends EventEmitter
 */
export class Plugin extends EventEmitter{
	constructor(bot){
		super();
		this.bot = bot;

		this._dependencies = new Set();
		this._commands 	   = new Set();
		this._managers 	   = new Map();
		this._enabled 	   = false;
	}

	get client(){
		return this.bot.client;
	}

	get name(){
		return this.constructor.name;
	}

	get managers(){
		return this._managers;
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
	 * Adds managers to the plugin
	 */
	addManagers(...managerClasses){
		managerClasses = flatten(managerClasses);
		managerClasses.forEach(managerClass => this.managers.set(managerClass, new managerClass(this)));
	}

	/**
	 * Get the manager instance
	 */
	getManager(managerClass){
		return this.managers.get(managerClass);
	}

	addCommands(...commandClasses){
		commandClasses = flatten(commandClasses);
		commandClasses.forEach(commandClass => this.commands.add(commandClass));
	}

	/**
	 * Enables the plugin
	 */
	async enable(){
		if(!this.enabled){
			logger.info(`Enabling plugin [${this.name}]`);

			// Enables managers
			for (let manager of this.managers.values())
				await manager.enable();
			
			// Register commands in the bot
			this.commands.forEach(commandClass => {
				if(commandClass.prototype instanceof Command){
					const command = new commandClass(this);

					logger.info(`Registering command [${command.constructor.name}]`)

					// Add main name
					if(!this.bot.commands.has(command.name))
						this.bot.commands.set(command.name, command);
					else logger.warn(`Duplicate command name ${command.name} [${command.constructor.name} in ${this.name}]`);

					// Add aliases
					command.aliases.forEach(alias => {
						if(!this.bot.commands.has(alias))
							this.bot.commands.set(alias, command)
						else logger.warn(`Duplicate command alias ${alias} [${command.constructor.name} in ${this.name}]`);
					});
				}
				else logger.warn(`Class [${commandClass.prototype.constructor.name}] is not a Command ! Skipping.`);
			});

			this._enabled = true;
		}
	}

	/**
	 * Disables the plugin
	 */
	async disable(){
		if(this.enabled){
			this._enabled = false;	

			// Disable managers
			for (let manager of this.managers.values())
				await manager.disable();

			// Unregister commands from the bot
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