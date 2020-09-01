import { HadesStarCommand } from '../HadesStarCommand';

export class BattlegroupCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'battlegroup'});
        super(plugin, options);
    }
}