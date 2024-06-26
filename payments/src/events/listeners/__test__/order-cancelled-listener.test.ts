import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@supatai/common";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: 'asfadf',
		price: 100,
		status: OrderStatus.Created
	});
	await order.save();

	const data: OrderCancelledEvent['data'] = {
		id: order.id,
		version: 1,
		ticket: {
			id: 'some random id can go here because we are not using it'
		}
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn()
	}

	return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
	const { listener, data, msg, order } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});