import { HadesStarCommand } from '../HadesStarCommand';

export class WhitestarsCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'whitestars'});
        super(plugin, options);
    }
}