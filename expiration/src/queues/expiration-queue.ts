// Code related to BullJS goes here
import Queue from 'bull';
import { expirationCompletePublisher } from "../events";

interface Payload {
	orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST
	}
});

expirationQueue.process(async (job) => {
	await expirationCompletePublisher({
		orderId: job.data.orderId
	});
});

export { expirationQueue };