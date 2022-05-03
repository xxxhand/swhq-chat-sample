import * as superTest from 'supertest';
import * as _ from 'lodash';
import { DbHelper } from './__helpers__/db-helper';
import { AppHelper } from './__helpers__/app-helper';

const _ENDPOINT = '/api/v1/client-auth';

interface IBody {
	name: string;
	callbackUrl: string;
};

describe('Register credential spec', () => {
	let agentClient: superTest.SuperAgentTest;
	const dbHelper = new DbHelper();
	const CLIENT_COL = 'clientcredentials';
	const colNames = [CLIENT_COL];
	const defaultBody: IBody = {
		name: 'iLearning',
		callbackUrl: 'https://xxx.ccc.com',
	};
	beforeAll(async (done) => {
		await dbHelper.tryOpen();
		await dbHelper.clearData(colNames);
		agentClient = await AppHelper.getInstance();
		done();
	});
	afterAll(async (done) => {
		await dbHelper.clearData(colNames);
		await dbHelper.tryClose();
		done();
	});
	describe('Required fileds', () => {
		test('[2001] Parameter "name" is empty', async (done) => {
			const b = _.cloneDeep(defaultBody);
			b.name = '';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			expect(res.status).toBe(400);
			expect(res.body.code).toBe(2001);
			expect(res.body.message).toBe('無效客戶名稱');

			done();
		});
		test('[2004] Parameter "callbackUrl" is empty', async (done) => {
			const b = _.cloneDeep(defaultBody);
			b.callbackUrl = '';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			expect(res.status).toBe(400);
			expect(res.body.code).toBe(2004);
			expect(res.body.message).toBe('無效客戶回調網址');

			done();
		});
		test('[2004] Parameter "callbackUrl" is invalid', async (done) => {
			const b = _.cloneDeep(defaultBody);
			b.callbackUrl = 'mqtt://sss.com';
			const res = await agentClient
				.post(_ENDPOINT)
				.send(b);

			expect(res.status).toBe(400);
			expect(res.body.code).toBe(2004);
			expect(res.body.message).toBe('無效客戶回調網址');

			done();
		});
	});
	describe('Success', () => {
		test.only('[success]', async (done) => {
			const res = await agentClient
				.post(_ENDPOINT)
				.send(defaultBody);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('result');
			expect(res.body.result.clientId).toEqual(expect.any(String));
			expect(res.body.result.clientSecret).toEqual(expect.any(String));
			expect(res.body.result.callbackUrl).toBe(defaultBody.callbackUrl);
			expect(res.body.result.name).toBe(defaultBody.name);

			const col = dbHelper.getCollection(CLIENT_COL);
			const c = await col.findOne({ 'clientId': res.body.result.clientId });
			expect(c).toBeTruthy();
			expect(c?.name).toBe(defaultBody.name);
			expect(c?.callbackUrl).toBe(defaultBody.callbackUrl);

			done();
		});
	});
});
