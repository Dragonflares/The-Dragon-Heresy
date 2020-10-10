import { GenericCommand } from '../GenericCommand';


export class InfoCommand extends GenericCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'info'});
        super(plugin, options);
    }
}