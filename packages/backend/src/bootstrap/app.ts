import * as path from 'path';
import Koa from 'koa';
import koaBody from 'koa-body';
import mount from 'koa-mount';
import serve from 'koa-static';
import { TNullable } from '@demo/app-common';
import { AppInitializer } from './app-initializer';
import { AppInterceptor } from './app-interceptor';
import * as appTracer from './app-request-tracer';
import v1Router from '../application/workflows/v1-router';

const _PUBLIC_PATH = '../../../../public';

export class App {

	private _app: TNullable<Koa> = null;

	constructor() {
		this._app = new Koa();
		this._init();
	}

	public static tryInitial = async () => {
		// await AppInitializer.tryDbClient();
		// await AppInitializer.tryRedis();
		AppInitializer.tryInjector();
	}

	get app() {
		return this._app?.callback();
	}

	private _init() {
		this._app?.use(mount('/api-docs', serve(path.resolve(<string>require.main?.path || __dirname, `${_PUBLIC_PATH}/api-docs`))));
		this._app?.use(koaBody({ jsonLimit: '10mb' }));
		this._app?.use(appTracer.forKoa());
		this._app?.use(AppInterceptor.beforeHandler);
		this._app?.use(AppInterceptor.errorHandler);
		this._app?.use(v1Router.routes());
		this._app?.use(AppInterceptor.completeHandler);
		this._app?.use(AppInterceptor.notFoundHandler);
	}
}
