import { injectable } from 'inversify';
import { Socket, Server } from 'socket.io';
import { CustomError, ICodeObject, TNullable } from '@demo/app-common';

@injectable()
export abstract class AbstractSocketHandler {
	private _rootServer: TNullable<Server> = null;
	public path: string = '';

	constructor(namespace = '') {
		this.path = `/wss/v1/${namespace}`;
	}

	makeError(err: any): ICodeObject {
		return CustomError.getCode(err.type);
	}

	getClientById(id: string): TNullable<Socket> {
		return this._rootServer?.of(this.path).sockets.get(id);
	}

	useServer(server: Server): void {
		this._rootServer = server;
	}

	abstract onConnection(socket: Socket): void;
	abstract onAuthorize(socket: Socket, next: (err?: Error) => void): Promise<void>;
}