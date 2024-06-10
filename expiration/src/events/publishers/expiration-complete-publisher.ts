import { Publisher, ExpirationCompleteEvent, Subjects } from "@supatai/common";
import { natsWrapper } from "../../nats-wrapper";

class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

export const expirationCompletePublisher = async (data: ExpirationCompleteEvent['data']) => {
	return await new ExpirationCompletePublisher(natsWrapper.client).publish(data);
};