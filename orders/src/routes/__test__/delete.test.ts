import request from 'supertest';
import mongoose from "mongoose";
import { app } from '../../app';
import { Ticket, Order, OrderStatus } from "../../models";
import { natsWrapper } from "../../nats-wrapper";

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	});

	await ticket.save();
	return ticket;
};

it('marks an order as cancelled', async () => {
	// create a ticket with Ticket model
	const ticket = await buildTicket();

	const user = global.signIn();
	// make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${ order.id }`)
		.set('Cookie', user)
		.send()
		.expect(204);

	// expectation to make sure the order is cancelled
	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
	// create a ticket with Ticket model
	const ticket = await buildTicket();

	const user = global.signIn();
	// make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make a request to cancel the order
	await request(app)
		.delete(`/api/orders/${ order.id }`)
		.set('Cookie', user)
		.send()
		.expect(204);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
