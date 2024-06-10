import { PaymentCreatedEvent, Publisher, Subjects } from "@supatai/common";
import { natsWrapper } from "../../nats-wrapper";

class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

export const paymentCreatedPublisher = async (data: PaymentCreatedEvent['data']) => {
	return await new PaymentCreatedPublisher(natsWrapper.client).publish(data);
};