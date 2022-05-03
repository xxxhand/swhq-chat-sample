import { CustomValidator } from '@demo/app-common';
import { JoinRoomRequest } from './join-room-request';

export class SendMessageRequest extends JoinRoomRequest {
	public content: string = '';
	public sendTo: string = '';

	public hasSpecificUser(): boolean {
		return CustomValidator.nonEmptyString(this.sendTo);
	}
}
