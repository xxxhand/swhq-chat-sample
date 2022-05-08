import { Socket } from 'socket.io';
import { injectable } from 'inversify';
import {
	LOGGER,
	CustomClassBuilder,
	CustomResult,
	CustomError,
	CustomValidator,
	CustomUtils,
} from '@demo/app-common';
import { RoomEvents } from '../../domain/enums/room-event-codes';
import { UserEntity } from '../../domain/entities/user-entiy';
import { JoinRoomRequest } from '../../domain/value-objects/join-room-request';
import { SendMessageRequest } from '../../domain/value-objects/send-message-request';
import {
	AdvertisementLocation,
	AdvertisementMessage,
	AdvertisementType,
} from '../../domain/value-objects/advertisement-message';
import { AbstractSocketHandler } from './abstract-socket-handler';

@injectable()
export class ChatRoomHandler extends AbstractSocketHandler {
	private _users: UserEntity[] = [];
	private _advertisements: AdvertisementMessage[] = [];
	private _pushIntervalInSeconds: number = 10;

	constructor() {
		super('chat-room');
		this._initAdvertisements();
		this._runInteval();
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
				try {
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
					const targetClient = this.getClientById(user?.connectionId);
					targetClient?.emit(RoomEvents.SEND_MSG_RES, res);
				} finally {
					socket.emit(RoomEvents.SEND_MSG_RES, res);
				}

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

	private _initAdvertisements = (): void => {
		const m0 = new AdvertisementMessage();
		m0.type = AdvertisementType.BROADCAST;
		m0.content = 'I am advertisement 0';
		m0.location = AdvertisementLocation.RT;
		this._advertisements.push(m0);

		const m1 = new AdvertisementMessage();
		m1.type = AdvertisementType.ADVERTISEMENT;
		m1.img = 'I am advertisement 1';
		m1.linkUrl = 'https://google.com';
		m1.location = AdvertisementLocation.LM;
		this._advertisements.push(m1);

	}

	private _pushAdvertisementToUser = (): void => {
		if (!CustomValidator.nonEmptyArray(this._users)) {
			LOGGER.info(`User is empty`);
			return;
		}

		let msgIdx: number = Number.parseInt(CustomUtils.generateRandomNumbers(1));
		if (msgIdx < 0 || msgIdx > this._advertisements.length - 1) {
			msgIdx = 0;
		}
		const msg = this._advertisements[msgIdx];

		let idx: number = Number.parseInt(CustomUtils.generateRandomNumbers(1));
		if (idx < 0 || idx > this._users.length - 1) {
			idx = 0;
		}
		const user = this._users[idx];

		const targetClient = this.getClientById(user.connectionId);

		LOGGER.info(`Send ${msgIdx} to ${targetClient?.id}`);
		targetClient?.emit(RoomEvents.SEND_MSG_RES, new CustomResult().withResult(msg));

	}

	private _runInteval = (): void => {
		setInterval(() => {
			this._pushAdvertisementToUser();
		}, this._pushIntervalInSeconds * 1000);
	}
}
