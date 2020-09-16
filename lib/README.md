# Library Implementation How To

This document will help write your own plugin and commands for the Bot.

## Configuration and starting the bot

The bot is using Environment Variables to gather his configuration.

You can create a `.env` in the root directory of the repository and add you own configuration.

The root directory contains a `.env.example` file containing the current available configuration.

Here is the list of the available environment variables

* `BOT_TOKEN`: This variable stores the Discrod token of the bot.
* `DATABASE`: This variable stores the connection string of the MongoDB database.
* `PREFIX`: This one is the command prefix of all commands used throughout the bot.
* `EXPERIENCE_DATABASE`: This variable store the path to the Experience SQLite database
* `LOGLEVEL`: This one store the logging level of the bot. If not specified, defaults to "info".
* `LOGCHAT`: Boolean. Allows to display the error message of a command, when it's correctly returned as a promise. 

To install the bot, use:
```
npm install
```

The start it using:
```
npm run start
```

You're good to go !

### Plugin structure 

When writing a plugin, there may be lots of functionalities involved.

So many that you need to structure and split your code.

The usual structure for a plugin should be this one:

```
MyPlugin/
	MyPlugin.js
	index.js
	commands/
		MyCommand
		index.js
	managers/
		MyManager
		index.js
```

Note the presence of the `index.js` files. They are used to expose all the modules you want your directory to expose.

This allows you to export your modules and import them nicely :

```javascript
// index.js file
export * from './MyCommand1';
export * from './MyCommand2';
export * from './MyCommand3';
```

Then you can import all you commands at once:

```javascript
import * as Commands from './commands';

// Now Commands is a Module, storing key/pair values of your module names and exported content
````

For more insight about this functionnality, please refer to Node import/export functions documentation.

### Coding convention

To keep the code as readable and maintainable as possible, some rules should be followed by contributing developers:

* Don't use console.log for logging. Use the globally defined `logger` for that purpose.
* Variables should NEVER start with an uppercase character. Use lower camelCase.
* Methods should NEVER start with an uppercase character. Use lower camelCase.
* Classes should ALWAYS start with an uppercase character. Use upper CamelCase.
* Use async/wait whenever possible. Try to avoid the usage of callbacks APIs and prefer promised version of them.
* ... more will come

## Bot

The `Bot` class is the core of the bot.

It creates the Discord client instance and is in charge of managing plugin.

To start a new bot simply run this:
```javascript

import { Bot } from './libs';

const bot = new Bot();
bot.start();

```

You can specify the plugins to use by passing them directory to the `Bot` constructor like so:
```javascript

import { Bot } from './libs';
import { MyPlugin1, MyPlugin2 } from './plugins';

const bot = new Bot(MyPlugin1, MyPlugin2);
bot.start();

```

But generally, you'll add every plugins available:
```javascript

import { Bot } from './libs';
import * as Plugins from './plugins';

const bot = new Bot(Object.values(Plugins));
bot.start();

```

## Plugin

A plugin is an extension of the bot which most of the time listen to messages and reacts to it.

A plugin is enabled or disabled by the bot using the two methods `enable` and `disable` which you can override to add your own code.

An empty plugin example:

```javascript
import { Plugin } from '../../lib';

export class MyPlugin extends Plugin{
	constructor(bot){
		super(bot);
	}

	async enable(){
		if(!this.enabled){
			// Do something when the bot enables this plugin
		}
		await super.enable();
	}

	async disable(){
		if(this.enabled){
			// Do something when the bot disables this plugin
		}
		await super.disable();
	}
}
```

The `Plugin` class exposes several properties giving access to the bot or the Discord client in any method:

```javascript
import { Plugin } from '../../lib';

export class MyPlugin extends Plugin{
	constructor(bot){
		super(bot);
	}

	async enable(){
		if(!this.enabled){
			// Registers a listener on the Discord client message
			this.client.on('message', this.onMessage);

			// Same as above, but directly on the Bot class
			this.bot.on('message', this.onMessage);
		}
		await super.enable();
	}

	async disable(){
		if(this.enabled){
			// Unregister the listener
			this.client.off('message', this.onMessage);
			this.bot.off('message', this.onMessage);
		}
		await super.disable();
	}

	onMessage = (message) => {
		//Whatever you want to do
	}
}
```
In this example you can see how to access the Discord client and use it as you want.

Usually, you will have a lot of stuff to listen to and may not want to put all your code in your plugin's class.

That's where `Manager` and `Command` enters the game

### Manager

Managers are used to add specific behavior to your plugin.

It's like a plugin in the plugin, it's main use it to have a cleaner code by separating concerns.

As an example, say you want to keep track of the user presence on the server, you'll create a `PresenceManager` and add it to the plugin like so:

```javascript
import { PresenceManager } from './managers';

export class MyPlugin extends Plugin{
	constructor(bot){
		super(bot);

		this.addManagers(PresenceManager);
	}
}
```

You don't need to enable or disable the Manager, they are automatically managed by the `Plugin` lifecycle once added.

But they also have these enable/disable method you can override

You then write your Manager like so:

```javascript
import { Manager } from './libs';

export class PresenceManager extends Manager{
	constructor(plugin){
		super(plugin);
	}

	enable(){
		if(!this.enabled){
			this.client.on('presenceUpdate', this.presenceHandler);
		}
		super.enable();
	}

	disable(){
		if(this.enabled){
			this.client.off('presenceUpdate', this.presenceHandler);
		}
		super.disable();
	}

	presenceHandler = (oldPresence, newPresence) => {
		//Whatever you want to do
	}
}
```

### Command

A `Command` is a message starting with the specified prefix on which the bot will react.

A command is added to the Plugin much like a `Manager`:

```javascript
import { MyCommand } from './commands';

export class MyPlugin extends Plugin{
	constructor(bot){
		super(bot);

		this.addCommands(MyCommand);
	}
}
```

Command are automatically registered to the bot when the plugin is enabled.

You can define your command this way:

```javascript
import { Command } from './lib';

export class MyCommand extends Command{
    constructor(plugin){
        super(plugin, {
            name: 'command',
            aliases: ['alias'],
            description: "My command description",
            usage: "&command <param>"
        });
    }

    async run(message, args){
       // Do whatever you want
    }
}
```

The plugin needs to define his name, aliases, description and usage by passing a configuration object to the Command instance.

Then you can do whatever you like with you command
