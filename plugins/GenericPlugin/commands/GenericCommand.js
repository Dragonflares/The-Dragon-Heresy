import { Command } from '../../../lib';

export class GenericCommand extends Command{
    constructor(plugin, options){
    	Object.assign(options, {category:"generic"});
        super(plugin, options);
    }
}