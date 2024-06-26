import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus, Ticket } from '../../models';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20
	});

	await ticket.save();
	return ticket;
};

it('returns an error if the ticket does not exist', async () => {
	const ticketId = new mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId })
		.expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
	const ticket = await buildTicket();

	const order = Order.build({
		ticket,
		userId: 'asdfjasdfasdf',
		status: OrderStatus.Created,
		expiresAt: new Date()
	});
	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(400);
});

it('successfully reserves a ticket', async () => {
	const ticket = await buildTicket();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(201);
});

it('emits an order created event', async () => {
	const ticket = await buildTicket();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signIn())
		.send({ ticketId: ticket.id })
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});