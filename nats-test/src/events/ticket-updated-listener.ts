import { Message } from 'node-nats-streaming';
import { Listener, TicketUpdatedEvent, Subjects } from '@supatai/common';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
	queueGroupName = 'payments-service';

	onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		console.log('Event data: ', data);

		msg.ack();
	}
}