require('dotenv').config();

import { MongoClient, Db, Collection } from 'mongodb';

export class DbHelper {
	private _client?: MongoClient = undefined;
	private _db?: Db = undefined;
	private _accessEnvironments = ['test', 'development', 'local'];

	public tryOpen = async (): Promise<void> => {
		this._client = new MongoClient(<string>process.env.X_DEF_MONGO_URI);
		await this._client.connect();
		this._db = this._client.db(<string>process.env.X_DEF_MONGO_DB_NAME);
	}

	public getCollection = (colName: string): Collection => {
		if (!this._db) {
			throw new Error('Db is null');
		}
		return this._db.collection(colName);
	}

	public tryClose = async (): Promise<void> => {
		if (this._client) {
			await this._client.close();
		}
	}

	public clearData = async (cols: string[]): Promise<void> => {
		if (this._accessEnvironments.includes(<string>process.env.NODE_ENV)) {
			const tasks: any[] = [];
			cols.forEach((x) => tasks.push(this.getCollection(x).deleteMany({})));
			await Promise.all(tasks);
		}
	}
}