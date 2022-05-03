import { DefaultContext } from 'koa';
import { CustomResult } from '@demo/app-common';

interface ISessionInfo {
	companyId: string;
	accountId: string;
	accountName: string;
}

export interface IStateResult<T = CustomResult> {
	result?: T;
};

export interface ICustomContext extends DefaultContext {
	sessionInfo?: ISessionInfo
}
