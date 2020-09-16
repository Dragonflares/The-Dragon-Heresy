import { HadesStarCommand } from '../HadesStarCommand';

export class MemberCommand extends HadesStarCommand{
    constructor(plugin, options){
    	Object.assign(options, {subcategory:'member'});
        super(plugin, options);
    }
}