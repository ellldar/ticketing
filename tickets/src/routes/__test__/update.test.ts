import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it('returns a 404 if the provided ticket id doesn\'t exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'Valid Title',
			price: 100
		})
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'Valid Title',
			price: 100
		})
		.expect(401);
});

it('returns a 401 if the user doesn\'t own the ticket', async () => {
	const title = 'Valid Title';
	const price = 100;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title, price
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'Another Title',
			price: 200
		})
		.expect(401);

	const ticket = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	// To make sure that changes weren't applied

	expect(ticket.body.title).toEqual(title);
	expect(ticket.body.price).toEqual(price);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
	const title = 'Valid Title';
	const price = 100;
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title, price
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			price
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title,
			price: -10
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title
		})
		.expect(400);
});

it('updates the tickets with provided valid inputs', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Valid Title',
			price: 100
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 200
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	expect(ticketResponse.body.title).toEqual('New Title');
	expect(ticketResponse.body.price).toEqual(200);
});

it('successfully publishes an event', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Valid Title',
			price: 100
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 200
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'Valid Title',
			price: 100
		})
		.expect(201);

	const ticket = await Ticket.findById(response.body.id);
	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'New Title',
			price: 200
		})
		.expect(400);

});