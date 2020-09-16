import { EventEmitter } from 'events';

export class Manager extends EventEmitter{
	constructor(plugin){
		super();

		this.plugin 	= plugin;
		this._enabled 	= false;
	}

	get bot(){
		return this.plugin.bot;
	}

	get client(){
		return this.bot.client;
	}

	get name(){
		return this.constructor.name;
	}

	/**
	 * Enables or disable the manager
	 * 
 	 * @type {boolean}
	 */
	get enabled(){ return this._enabled }
	set enabled(enabled){
		enabled ? this.enable() : this.disable();
	}

	enable(){
		if(!this.enabled){
			this._enabled = true;
		}
	}

	disable(){
		if(this.enabled){
			this._enabled = false;
		}
	}
}