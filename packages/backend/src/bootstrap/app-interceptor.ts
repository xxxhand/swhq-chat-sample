import { ParameterizedContext, Next } from 'koa';
import { LOGGER, HttpCodes, CustomError, CustomResult, getTraceId } from '@demo/app-common';
import { IStateResult } from '../domain/types';

export class AppInterceptor {
	/**
	 * Before starting request handler
	 * @param ctx 
	 * @param next 
	 */
	static async beforeHandler(ctx: ParameterizedContext, next: Next): Promise<Next> {
		LOGGER.info('-----------------------------------------------------------');
		LOGGER.info(`${ctx.method} ${ctx.path} - start`);
		return next();
	}


	static async errorHandler(ctx: ParameterizedContext, next: Next): Promise<void> {
		try {
			await next();
		} catch (ex) {
			const error = CustomError.fromInstance(ex);
			const str = `${ctx.method} ${ctx.originalUrl} - ${error.httpStatus} [${error.type}] ${error.message}`;
			if (error.isException()) {
				LOGGER.error(str);
			} else {
				LOGGER.warn(str);
			}
			ctx.status = error.httpStatus;
			ctx.body = new CustomResult()
				.withTraceId(getTraceId())
				.withCode(error.code)
				.withMessage(error.message);
		}
	}
	/**
	 * Complete request
	 * @param ctx 
	 * @param next 
	 */
	static async completeHandler(ctx: ParameterizedContext<IStateResult>, next: Next): Promise<void> {
		if (!ctx.state.result) {
			next();
			return;
		}

		LOGGER.info(`${ctx.method} ${ctx.originalUrl} - 200`);
		ctx.state.result.traceId = getTraceId();
		ctx.status = HttpCodes.OK;
		ctx.body = ctx.state.result;
	}

	/**
	 * Path not found handler
	 * @param ctx 
	 */
	static async notFoundHandler(ctx: ParameterizedContext): Promise<void> {
		LOGGER.info(`${ctx.method} ${ctx.originalUrl} - 404 Path not found`);
		ctx.status = 404;
		ctx.body = `${ctx.method} ${ctx.originalUrl} - 404 Path not found`;
	}
}