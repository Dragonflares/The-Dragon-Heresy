import DotEnv from 'dotenv';
import { Bot } from './lib';
import * as Plugins from './plugins';

(async () => {
	const bot = new Bot(Object.values(Plugins));
	await bot.start();
})()