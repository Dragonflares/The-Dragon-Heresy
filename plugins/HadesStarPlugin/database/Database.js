import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

export class Database{
	constructor(connectionString){
		this.connectionString = connectionString;

		this.connection = null;
	}
	async connect(){
		console.debug(`Connecting to ${this.connectionString}`);

		await mongoose.connect(this.connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).catch(console.error);

		mongoose.connection.on("error", console.log);

		this.connection = mongoose.connection;
	}

	async disconnect(){
		if(this.connection){
			console.debug(`Disconnecting from ${this.connectionString}`);
			this.connection.close();
		}
	}

	async initialize(){
		console.debug(`Building db structure...`);

		// await mongoose.connection.createCollection("Corp");
		// await mongoose.connection.createCollection("Member");
		// await mongoose.connection.createCollection("Tech");
		// await mongoose.connection.createCollection("Battleship");
		// await mongoose.connection.createCollection("Battlegroup");
		// await mongoose.connection.createCollection("Miner");
		// await mongoose.connection.createCollection("Transport");
	}
}