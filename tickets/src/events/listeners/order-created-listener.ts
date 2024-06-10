import { Listener, OrderCreatedEvent, Subjects } from "@supatai/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { ticketUpdatedPublisher } from "../../events";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// Find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// If no ticket, throw an error
		if (!ticket)
			throw new Error('Ticket not found');

		// Mark the ticket as being reserved by setting its orderId property
		ticket.set({ orderId: data.id });

		// Save the ticket
		await ticket.save();

		// Publish an event to notify that ticket has been updated
		await ticketUpdatedPublisher({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId
		});

		// Ack the message
		msg.ack();
	}
}