import DotEnv from 'dotenv';
import { Bot } from './lib';
import * as Plugins from './plugins';
import {
	ExperiencePlugin
} from './plugins';

DotEnv.config();
(async () => {
	const bot = new Bot(Object.values(Plugins));
	await bot.start();
	console.log('Ready !');
})()