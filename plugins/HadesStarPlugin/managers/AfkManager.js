import { Manager } from '../../../lib';
import { Member } from '../database';
import * as timeUtils from '../utils/timeUtils.js'

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
        let personPinging = await Member.findOne({ discordId: message.author.id.toString() }).populate('Corp').exec();
        if (!personPinging) return;
        if (personPinging.Corp.corpId !== message.guild.id.toString()) return;

        message.mentions.members.forEach(async m => {
            let member = await Member.findOne({ discordId: m.id.toString() }).exec();
            if (!member) return;
            if (member.awayTime) {
                let awayTime = new Date();
                if (awayTime.getTime() < member.awayTime.getTime()) {

                    let {diffDays, diffHrs, diffMins } = timeUtils.timeDiff(member.awayTime,awayTime);

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