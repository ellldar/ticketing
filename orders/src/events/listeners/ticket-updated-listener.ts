import { Listener, Subjects, TicketUpdatedEvent } from "@supatai/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
		// const ticket = await Ticket.findById(data.id);
		const ticket = await Ticket.findByEvent(data);

		if (!ticket)
			throw new Error('Ticket not found');

		const { title, price } = data;
		ticket.set({ title, price });
		await ticket.save();

		// // Alternative solution to updating versions
		// const { title, price, version } = data;
		// ticket.set({ title, price, version });
		// await ticket.save();

		msg.ack();
	}
}