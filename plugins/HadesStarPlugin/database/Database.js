import mongoose from 'mongoose';

//mongoose.set('useCreateIndex', true);
//mongoose.set('useFindAndModify', false);

export class Database{
	constructor(connectionString){
		this.connectionString = connectionString;

		this.connection = null;
	}
	async connect(){
		logger.debug(`Connecting to ${this.connectionString}`);

		await mongoose.connect(this.connectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).catch(console.error);

		mongoose.connection.on("error", console.log);

		this.connection = mongoose.connection;
	}

	async disconnect(){
		if(mongoose.connection){
			logger.debug(`Disconnecting from ${this.connectionString}`);
			mongoose.connection.close();
		}
	}
}