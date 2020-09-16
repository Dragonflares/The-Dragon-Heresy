import { HadesStarCommand } from '../HadesStarCommand';

export class ShipCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'ship'});
        super(plugin, options);
    }
}