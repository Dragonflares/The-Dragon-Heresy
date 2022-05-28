import { Manager } from '../../../lib';
import { Corp, RedStarQueue, RedStarLog} from '../database';
const Discord = require('discord.js');
import Mongoose from 'mongoose'
import * as RsQueuesUtils from '../utils/redStarsQueuesUtils'

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
            rsQueues.forEach( async newRedStarQueue => {

                //Fetch recruit message
                let messageReaction = await this.client.channels.cache.get(newRedStarQueue.recruitChannel).messages.fetch(newRedStarQueue.recruitMessage.toString());
        
                // Fetch status message
                let currentStatusMessage = null
                try{ // Check if message is gone
                    currentStatusMessage = await this.client.channels.cache.get(newRedStarQueue.recruitChannel).messages.fetch(newRedStarQueue.currentStatusMessage.toString());
                }catch(r){}

                //Create collector
                        // Create button collector for the message
                const filter = (button) => button.clicker.user.bot == false;
                const collector = messageReaction.createButtonCollector(filter);

                // Listen to buttons
                collector.on('collect', async b => {
                    RsQueuesUtils.collectorFunc(this.client, messageReaction, newRedStarQueue, b)
                });
            })
        })
    }

    CheckRedStarQueues = async (client) => {
        await RedStarQueue.find({"timeToTimeout":{"$lte": new Date()}}).exec().then(async rsQueues => {
            rsQueues.forEach( async rsQueue => {

                //Fetch recruit message
                let msgRecruit = await this.client.channels.cache.get(rsQueue.recruitChannel).messages.fetch(rsQueue.recruitMessage.toString());
       
                //Delete status message
                let currentStatusMessage = null
                try{ // Check if message is gone
                    currentStatusMessage = await this.client.channels.cache.get(rsQueue.recruitChannel).messages.fetch(rsQueue.currentStatusMessage.toString());
                }catch(e){}
                if (currentStatusMessage) currentStatusMessage.delete({ timeout: 1 });

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
                    membersIds: Array.from(rsQueue.registeredPlayers.keys()).map(a => a.id)
                })
                corp.redStarLogs.push(newRSLog)
                await newRSLog.save()
                await corp.save()

                //Update embeed to timed out
                RsQueuesUtils.failed(client, msgRecruit, rsQueue, true)

            })})
        .catch(err => console.log(err))
    }   

    disable() {
        if (this.enabled) {

        }
        super.disable();
    }
}