import { EventEmitter } from 'events';
import { Client, Collection } from 'discord.js';
import { flatten } from 'array-flatten';
import loggerBuilder from 'loglevel-colors';
import DotEnv from 'dotenv';
import { Plugin } from './Plugin';
import { commandError } from './utils';
DotEnv.config();
global.logger = loggerBuilder('BOT', process.env.LOGLEVEL || "info");


/**
 * Base class for Bot 
 *
 * @extends EventEmitter
 */
export class Bot extends EventEmitter{
	constructor(...pluginClasses){
		super();
		this.prefix	    = process.env.PREFIX || '&';
		this.client 	= new Client();
		this.plugins 	= new Map();
		this.commands 	= new Map();
		this.disbut	    = require('discord-buttons')(this.client); // Requiring discord-buttons and binding it to the initialised client.
		this.addPlugins(Object.values(pluginClasses));


		this.client.on('message', this.handleMessage);
	}

	/**
	 * Adds plugins to the Discord instance
	 */
	addPlugins(...pluginClasses){
		pluginClasses = flatten(pluginClasses);
		pluginClasses.forEach(pluginClass => {
			if(pluginClass.prototype instanceof Plugin)
				this.plugins.set(pluginClass, new pluginClass(this))
		});

		this.sort();
	}

	/**
	 * Get the plugin instance
	 */
	getPlugin(pluginClass){
		return this.plugins.get(pluginClass);
	}

	/**
	 * Sort the plugins by priority and dependencies
	 */
	sort(){
		//Create dependencies
		this.plugins.forEach(plugin => {
			plugin.dependencies.forEach(dependency => {
				if(!this.plugins.has(dependency))
					this.plugins.set(dependency, new dependency(this));
			});
		});

		this.plugins = new Map(this.toposort(Array.from(this.plugins.values())).map(plugin => [plugin.constructor, plugin]));
	}

	/**
	 * Stable Topological sorting by plugin priority and dependencies
	 * @param {Array} plugins - The plugins to sort.
	 */
	toposort(plugins){
		let D = new Map();
		plugins.forEach(plugin => D.set(plugin, Array.from(plugin.dependencies.keys()).map(clazz => this.plugins.get(clazz))));


		const G = Array.from(D.keys()).reduce((p, c) => p.set( c, Array.from(D.keys()).filter(e => D.get(e).includes(c))), new Map());
		const Q = Array.from(D.keys()).filter(e => D.get(e).length == 0).sort((a, b) => a.priority - b.priority);
		const S = [];
		while (Q.length) {
			const u = Q.pop();
			S.push(u);
			var temp = [];
			G.get(u).forEach(v => {
				D.set(v, D.get(v).filter(e => e !== u));
				if (D.get(v).length == 0) {
					temp.push(v);
				}
			});
			temp.sort((a, b) => a.priority - b.priority).forEach(item => Q.push(item));
		}
		return S;
	}

	async start(){
		await this.connect();

		for (let plugin of this.plugins.values()){
			try{
				await plugin.enable();
			}
			catch(e){
				logger.error(e);
				logger.warn(`Plugin [${plugin.name}] is crashing, disabling`);
				plugin.disable();
			}
		}

		logger.info("Bot started successfully !");
	}

	async stop(){
		for (let plugin of this.plugins.values())
			await plugin.disable();

		await this.disconnect();

		logger.info("Bot stopped");
	}

	/**
	 * Connects the bot to discord
	 * @returns {string} The discord bot token
	 */
	async connect(){
		if(!process.env.BOT_TOKEN)
			throw new Error("BOT_TOKEN environment variable is not defined");

		logger.info('Connecting to discord...');
		return await this.client.login(process.env.BOT_TOKEN).catch(console.error);
	}

	/**
	 * Connects the bot to discord
	 * @returns {string} The discord bot token
	 */
	async disconnect(){
		logger.info('Disconnecting from discord...');
		return await this.client.destroy();
	}

	/**
	 * Handles incoming discord messages
	 */
	handleMessage = (message) => {
		if(message.author.bot) return;
    	if(!message.guild) return;

    	if (message.content.startsWith(this.prefix))
			this.handleCommand(message);
    	this.emit('message', message);
	}

	/**
	 * Handles prefixed commands
	 */
	handleCommand(message){

		const blacklist = ['@everyone', /<((@!)|(@&)|#)?\d+>/g, ]
		let args 	= message.content.slice(this.prefix.length)
		blacklist.forEach(item => args = args.replace(item, ''))
		args = args.trim().split(/\s+/g);

		console.log(args);

		const name 	= args.shift().toLowerCase();

		if(name.length === 0)
			return message.channel.send("There's no command mentioned.");

		let command = this.commands.get(name);

		// If a command is finally found, run the command
		if(command){
			logger.debug(`Running command [${command.name}] with args [${args}]`);
			return command.run(message, args).catch(e => {
				commandError(message, e);
			});
		}
		
		message.channel.send("That's no valid command!")
	}
}