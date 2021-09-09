import { MemberCommand } from './MemberCommand';
import { Member } from '../../database';

export class BackCommand extends MemberCommand {
    constructor(plugin) {
        super(plugin, {
            name: 'back',
            aliases: ['bk','abk'],
            description: "Sets you back from afk",
            usage: "&back"
        });
    }

    async run(message, args) {
        let target
        let user = message.mentions.users.first()
        if (!user) {
            target = message.guild.member(message.author)
        }
        else if (message.author.id === this.client.creator)
            target = user
        else return message.channel.send("You cannot set another Member's afk!")

        let member = await Member.findOne({ discordId: target.id.toString() }).populate('Corp').populate('techs').exec();
        if (!member)
            return message.channel.send("You aren't part of any Corporation. Join a Corporation first.")

        let awayTime = new Date();
        member.awayTime = awayTime;
        await member.save();
        return message.channel.send("Welcome Back!")
    }

}
