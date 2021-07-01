import { Manager } from '../../../lib';
import { Member, WhiteStar } from '../database';
export class AfkManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            this.client.on('message', async message => this.myListener(message))
        }
        super.enable();
    }

    myListener = async (message) => {
        if (message.author.bot) return;

        //check if pinger is in the corp
        let personPinging = await Member.findOne({ discordId: message.author.id.toString() }).populate('Corp').populate('techs').exec();
        if (!personPinging) return;
        if (personPinging.Corp.corpId !== message.guild.id.toString()) return;

        message.mentions.members.forEach(async m => {
            let member = await Member.findOne({ discordId: m.id.toString() }).populate('Corp').populate('techs').exec();
            if (!member) return;
            if (member.awayTime) {
                let awayTime = new Date();
                if (awayTime.getTime() < member.awayTime.getTime()) {
                    let time = member.awayTime.getTime() - awayTime.getTime()
                    var diffDays = Math.floor(time / 86400000); // days
                    var diffHrs = Math.floor((time % 86400000) / 3600000); // hours
                    var diffMins = Math.round(((time % 86400000) % 3600000) / 60000); // minutes

                    if (member.awayDesc == "") {
                        return message.channel.send(`${member.name} is away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes`)
                    }
                    else {
                        return message.channel.send(`${member.name} is away for ${diffDays} Days , ${diffHrs} Hours and ${diffMins} Minutes\
                                \nReason: ${member.awayDesc}`)
                    }
                }
            }
        });


    }

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}