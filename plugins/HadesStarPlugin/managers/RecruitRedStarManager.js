import { Manager } from '../../../lib';
import { Corp, RedStarQueue, RedStarLog } from '../database';
import Mongoose from 'mongoose'
import * as RsQueuesUtils from '../utils/redStarsQueuesUtils'
import { CommandInteractionOptionResolver } from 'discord.js';

export class RecruitRedStarManager extends Manager {
    constructor(plugin) {
        super(plugin);
    }

    enable() {
        if (!this.enabled) {
            // Resync Queues
            this.RelistenQueues()

            let interval;
            interval = setInterval(this.CheckRedStarQueues, 10 * 1000);
        }
        super.enable();
    }

    RelistenQueues = async () => {
        await RedStarQueue.find().exec().then(async rsQueues => {
            rsQueues.forEach(async newRedStarQueue => {

                //Fetch recruit message
                let messageReaction = await this.client.channels.cache.get(newRedStarQueue.recruitChannel).messages.fetch(newRedStarQueue.recruitMessage.toString());

                //Create collector
                const filter = (button) => button.user.bot == false;
                const collector = messageReaction.createMessageComponentCollector(filter);

                await RsQueuesUtils.deleteOldStatusMsgs(this.client, newRedStarQueue)

                let sendData = await RsQueuesUtils.updateEmbed(this.client, messageReaction, newRedStarQueue, false) //Update the Embeed to show the new reaction   
                if (sendData)
                   await RsQueuesUtils.sendStatusMsg(this.client, messageReaction, newRedStarQueue)
                // Save

                await newRedStarQueue.save();

                // Listen to buttons
                collector.on('collect', async b => {
                    await RsQueuesUtils.collectorFunc(this.client, messageReaction, newRedStarQueue, b)
                });

            })
        })
    }

    CheckRedStarQueues = async (client) => {
        await RedStarQueue.find({ "timeToTimeout": { "$lte": new Date() } }).exec().then(async rsQueues => {
            rsQueues.forEach(async rsQueue => {

                //Fetch recruit message
                let msgRecruit = await this.client.channels.cache.get(rsQueue.recruitChannel).messages.fetch(rsQueue.recruitMessage.toString());

                //Save RS log
                //Timeout
                let corp = await Corp.findOne({ corpId: msgRecruit.guild.id.toString() }).populate('members').exec();
                let newRSLog = new RedStarLog({
                    _id: new Mongoose.Types.ObjectId(),
                    corpOpened: corp,
                    level: rsQueue.rsLevel,
                    timeClosed: new Date(),
                    endStatus: "Timeout",
                    creatorId: msgRecruit.author.id,
                    membersIds: Array.from(rsQueue.registeredPlayers.keys())
                })
                corp.redStarLogs.push(newRSLog)
                await newRSLog.save()
                await corp.save()

                //Update embeed to timed out
                RsQueuesUtils.failed(this.client, msgRecruit, rsQueue, true)

            })
        })
            .catch(err => console.log(err))
    }

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}
