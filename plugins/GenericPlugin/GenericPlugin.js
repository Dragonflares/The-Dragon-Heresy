import { Plugin } from '../../lib';
import { HelpCommand } from './HelpCommand';

export class GenericPlugin extends Plugin{
	constructor(bot){
		super(bot);

		this.commands.add(HelpCommand);
	}

}