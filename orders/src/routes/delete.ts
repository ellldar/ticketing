import express from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from "@supatai/common";
import { Order, OrderStatus } from '../models';
import { orderCancelledPublisher } from "../events";

const router = express.Router();

router.delete('/api/orders/:orderId',
	requireAuth,
	async (req, res) => {
		const order = await Order.findById(req.params.orderId).populate('ticket');

		if (!order)
			throw new NotFoundError();

		if (order.userId !== req.currentUser!.id)
			throw new NotAuthorizedError();

		order.status = OrderStatus.Cancelled;
		await order.save();

		// publish an event notifying other services that this order was cancelled
		await orderCancelledPublisher({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id
			}
		});

		res.status(204).send(order);
	}
);

export { router as deleteOrderRouter };