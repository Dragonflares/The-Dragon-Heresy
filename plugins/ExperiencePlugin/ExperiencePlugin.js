import Database from "better-sqlite3";
import { Plugin } from '../../lib';
import { RankCommand } from './RankCommand';

export class ExperiencePlugin extends Plugin{
	constructor(bot){
		super(bot);

		if(!process.env.EXPERIENCE_DATABASE)
			throw new Error("EXPERIENCE_DATABASE environment variable is not defined");

		this.commands.add(RankCommand);
	}

	async enable(){
		if(!this.enabled){
			this.sql = new Database(process.env.EXPERIENCE_DATABASE);

			
			const table = this.sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xp';").get();
		    if (!table['count(*)']) {
		        this.sql.prepare("CREATE TABLE xp (id TEXT PRIMARY KEY, user TEXT, guild TEXT, experience INTEGER, level INTEGER);").run();
		        this.sql.prepare("CREATE UNIQUE INDEX idx_xp_id ON xp (id);").run();
		        this.sql.pragma("synchronous = 1");
		        this.sql.pragma("journal_mode = wal");
		    }

		    this.getXp = this.sql.prepare("SELECT * FROM xp WHERE user = ? AND guild = ?");
			this.setXp = this.sql.prepare("INSERT OR REPLACE INTO xp (id, user, guild, experience, level) VALUES (@id, @user, @guild, @experience, @level);");

		    this.bot.on('message', this.updateXp)
		}
		await super.enable();
	}

	async disable(){
		if(this.enabled){
		    this.bot.off('message', this.updateXp);
		    this.sql.close();
		}
		await super.disable();
	}

	updateXp = (message) => {
		let xp = this.getXp.get(message.author.id, message.guild.id);
	    if (!xp) {
	        xp = {
	        	id: `${message.guild.id}-${message.author.id}`,
	        	user: message.author.id,
	        	guild: message.guild.id,
	        	experience: 0,
	        	level: 1
	        }
	    }

	    let xpAdd;

	    if(message.content.startsWith(this.bot.prefix)) {
	        xpAdd = Math.floor(Math.random() * 15) + 10
	    }
	    else {
	        xpAdd = Math.floor(Math.random() * 7) + 8
	    }

	    xp.experience += xpAdd;
	    const nxtlevel = 300 * xp.level
	    if(xp.experience > nxtlevel) {
	        xp.level++;
	        xp.experience -= nxtlevel
	        if(xp.level%5 === 0) {
	            let leveleupEmbed = new Discord.RichEmbed()
	            .setTitle("Level UP!")
	            .setColor("a500ff")
	            .addField(`Congratulations ${message.author.tag}! You are now level ${xp.level}!`, `Thanks for so many contributions`)
	    
	            message.channel.send(leveleupEmbed)
	        }
	    }
	    this.setXp.run(xp);
	}
}