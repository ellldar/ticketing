import mongoose from 'mongoose';
import { Ticket } from '../ticket';

const buildTicket = () => {
	return Ticket.build({
		title: 'movie',
		price: 420,
		userId: new mongoose.Types.ObjectId().toHexString()
	});
};

it('implements optimistic concurrency control', async () => {
	// Create an instance of a ticket
	const ticket = buildTicket();

	// Save the ticket to the database
	await ticket.save();

	// Fetch the ticket twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	// Make two separate changes to the tickets we fetched
	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 20 });

	// Save the first fetched ticket
	await firstInstance!.save();

	// Save the second fetched ticket and expect an error
	try {
		await secondInstance!.save();
	} catch (err) {
		return;
	}

	throw new Error('Should not reach this point');

	// expect(async () => {
	// 	await secondInstance!.save();
	// }).toThrow('VersionError');
});

it('increments the version number on multiple saves', async () => {
	const ticket = buildTicket();

	await ticket.save();
	expect(ticket.version).toEqual(0);
	await ticket.save();
	expect(ticket.version).toEqual(1);
	await ticket.save();
	expect(ticket.version).toEqual(2);
});