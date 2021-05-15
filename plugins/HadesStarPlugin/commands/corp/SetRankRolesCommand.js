import { CorpCommand } from './CorpCommand';
import { Corp } from '../../database';
import { RankRoles } from '../../database';

export class SetRankRolesCommand extends CorpCommand{
    constructor(plugin){
        super(plugin, {
            name: 'setrankroles',
            aliases: ['srr'],
            description: "Sets the role for one of the known categories: \n" +
            " - SupremeCommander. \n - FirstOfficers. \n - Officers. \n - Members. \n - Mercenaries. \n - Traders. \n - WhiteStarCO.\n" + 
            "To use this command, the category must be the name of any of the previously mentioned, and for the role, either the role's name, or tag the role.",
            usage: "&setrankroles <category> <role>."
        });
    }
}