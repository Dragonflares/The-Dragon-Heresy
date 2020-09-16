import { Plugin } from '../../lib';
import { Database } from './database';
import * as Managers from './managers';
import * as Commands from './commands';

export class HadesStarPlugin extends Plugin{
	constructor(bot){
		super(bot);

		this.db = new Database(process.env.DATABASE);

		this.addManagers(Object.values(Managers));
		this.addCommands(Object.values(Commands));
	}

	async enable(){
		if(!this.enabled){
			// Connect to database
			await this.db.connect();
		}
		await super.enable();
	}

	async disable(){
		if(this.enabled){
			// Disconnect from database
			await this.db.disconnect();
		}
		await super.disable();
	}
}