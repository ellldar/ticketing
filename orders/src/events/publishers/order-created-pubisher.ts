import { Publisher, OrderCreatedEvent, Subjects } from "@supatai/common";
import { natsWrapper } from "../../nats-wrapper";

class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

export const orderCreatedPublisher = async (data: OrderCreatedEvent['data']) => {
	return await new OrderCreatedPublisher(natsWrapper.client).publish(data);
};