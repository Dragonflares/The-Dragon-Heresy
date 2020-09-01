import { HadesStarCommand } from '../HadesStarCommand';

export class OfficerCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'officer'});
        super(plugin, options);
    }
}