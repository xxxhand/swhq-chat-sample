import * as superTest from 'supertest';
import { App } from '../../src/bootstrap/app';

export class AppHelper {
	private static _agent?: superTest.SuperAgentTest = undefined;

	private constructor() { }

	public static getInstance = async (): Promise<superTest.SuperAgentTest> => {
		if (!this._agent) {
			await App.tryInitial();
			this._agent = superTest.agent(new App().app);
		}
		return this._agent;
	}
}