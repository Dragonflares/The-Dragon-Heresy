import DotEnv from 'dotenv';
import { DiscordBot } from './lib';
import { ExperiencePlugin } from './plugins';

DotEnv.config();

(async () => {
	const bot = new DiscordBot(ExperiencePlugin);
	await bot.connect();
	console.log('Ready !');
})()