import { HadesStarCommand } from '../HadesStarCommand';

export class CorpCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'corp'});
        super(plugin, options);
    }
}