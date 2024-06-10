import mongoose from "mongoose";
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models';

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	});

	await ticket.save();
	return ticket;
};

it('returns an error when order is not found', async () => {
	const orderId = new mongoose.Types.ObjectId();

	await request(app)
		.get(`/api/orders/${orderId}`)
		.set('Cookie', global.signIn())
		.send()
		.expect(404);
});

it('fetches the order', async () => {
	// Create a ticket
	const ticket = await buildTicket();

	const user = global.signIn();
	// make a request to build an order with provided ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	// make a request to fetch the order
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${ order.id }`)
		.set('Cookie', user)
		.send()
		.expect(200);

	expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error when order is accessed by unauthorized user', async () => {
	const ticket = await buildTicket();

	// make a request to build an order with provided ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(201);

	// make a request to fetch the order
	await request(app)
		.get(`/api/orders/${ order.id }`)
		.set('Cookie', global.signIn())
		.send()
		.expect(401);
});
