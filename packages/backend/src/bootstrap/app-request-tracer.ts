import { ParameterizedContext, Next } from 'koa';
import { defaultNameSpace, CustomUtils, TNullable } from '@demo/app-common';

export const forKoa = ({
	useHeader = true,
	headerName = 'X-Request-Id',
} = {}) => (ctx: ParameterizedContext, next: Next) => {
	defaultNameSpace.bindEmitter(ctx.req);
	defaultNameSpace.bindEmitter(ctx.res);

	let reqId: TNullable<string> = '';
	if (useHeader) {
		reqId = ctx.request.header[headerName.toLowerCase()] as TNullable<string>;
	}
	reqId = reqId || CustomUtils.generateUUIDV4();

	return new Promise(defaultNameSpace.bind((res, rej) => {
		defaultNameSpace.set('requestId', reqId);
		return next().then(res).catch(rej);
	}));
};