import { Plugin } from '../../lib';
import * as Managers from './managers';
import * as Commands from './commands';

export class GenericPlugin extends Plugin{
	constructor(bot){
		super(bot);

		this.addManagers(Object.values(Managers));
		this.addCommands(Object.values(Commands));
	}

}