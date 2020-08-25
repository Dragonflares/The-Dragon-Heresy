import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const connectionString = process.env.DATABASE;

export class Database{
	static async connect(){
		console.debug(`Connecting to ${connectionString}`);

		await mongoose.connect(connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).catch(console.error);

		mongoose.connection.on("error", console.log);

		return mongoose.connection;
	}

	static async initialize(){
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