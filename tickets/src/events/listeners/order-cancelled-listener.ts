import { Listener, OrderCancelledEvent, Subjects } from "@supatai/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { ticketUpdatedPublisher } from "../../events";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket)
			throw new Error('Ticket not found');

		ticket.set({ orderId: undefined });
		await ticket.save();

		await ticketUpdatedPublisher({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId
		});

		msg.ack();
	}
}