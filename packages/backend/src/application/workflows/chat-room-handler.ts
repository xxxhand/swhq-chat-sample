import { Socket } from 'socket.io';
import { injectable } from 'inversify';
import {
	LOGGER,
	CustomClassBuilder,
	CustomResult,
	CustomError,
} from '@demo/app-common';
import { RoomEvents } from '../../domain/enums/room-event-codes';
import { UserEntity } from '../../domain/entities/user-entiy';
import { JoinRoomRequest } from '../../domain/value-objects/join-room-request';
import { SendMessageRequest } from '../../domain/value-objects/send-message-request';
import { AbstractSocketHandler } from './abstract-socket-handler';

@injectable()
export class ChatRoomHandler extends AbstractSocketHandler {
	private _users: UserEntity[] = [];

	constructor() {
		super('chat-room');
	}
	public onAuthorize = async (socket: Socket, next: (err?: Error) => void): Promise<void> => {
		LOGGER.info(`Connection id ${socket.id} connecting...`);
		return next();
	}
	public onConnection = (socket: Socket): void => {
		LOGGER.info(`Client ${socket.id} connected to ${this.path}...`);
		socket
			.on(RoomEvents.SEND_MSG, async (msg: any): Promise<void> => {

				const mReq = <SendMessageRequest>CustomClassBuilder.build(SendMessageRequest, msg);
				const res = new CustomResult().withResult(mReq);
				if (!mReq.hasSpecificUser()) {
					LOGGER.info(`Send to all user`);
					socket.to(mReq.chatRoomId).emit(RoomEvents.SEND_MSG_RES, res);
					return;
				}
				const user = this._users.find((x) => x.account === mReq.sendTo);
				if (!user) {
					socket.to(mReq.chatRoomId).emit(RoomEvents.SEND_MSG_RES, res);
					return;
				}
				LOGGER.info(`Send to specific user ${mReq.sendTo}`);
				const targetClient = socket.nsp.sockets.get(user?.connectionId);
				targetClient?.emit(RoomEvents.SEND_MSG_RES, res);
			})
			.on(RoomEvents.JOIN_ROOM, async (msg: any): Promise<void> => {
				const res = new CustomResult();
				try {
					const mReq = <JoinRoomRequest>CustomClassBuilder.build(JoinRoomRequest, msg)?.checkRequired();
					LOGGER.info(`Find user with account ${mReq.userId}`);
					let user = this._users.find((x) => x.account === mReq.userId);
					if (!user) {
						user = new UserEntity();
						user.account = mReq.userId;
						user.name = mReq.userName;
						user.roomId = mReq.chatRoomId;
						this._users.push(user);
					}
					user.connectionId = socket.id;

					socket.join(mReq.chatRoomId);
					LOGGER.info(JSON.stringify(this._users));
					res.withResult(this._users);
				} catch (ex) {
					res.withErrorCode(CustomError.getCode(CustomError.fromInstance(ex).type));
				} finally {
					socket.emit(RoomEvents.JOIN_ROOM_RES, res);
				}
			});
	}
}
