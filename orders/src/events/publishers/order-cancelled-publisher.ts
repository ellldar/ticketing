import { Subjects, Publisher, OrderCancelledEvent } from "@supatai/common";
import { natsWrapper } from "../../nats-wrapper";

class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

export const orderCancelledPublisher = async (data: OrderCancelledEvent['data']) => {
	return await new OrderCancelledPublisher(natsWrapper.client).publish(data);
};