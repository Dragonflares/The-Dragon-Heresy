import { Command } from '../../../lib';

export class HadesStarCommand extends Command{
    constructor(plugin, options){
    	Object.assign(options, {category:"hades' star"});
        super(plugin, options);
    }
}