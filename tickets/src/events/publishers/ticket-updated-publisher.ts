import { Publisher, Subjects, TicketUpdatedEvent } from '@supatai/common';
import { natsWrapper } from "../../nats-wrapper";

class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

export const ticketUpdatedPublisher = async (data: TicketUpdatedEvent['data']) => {
	return await new TicketUpdatedPublisher(natsWrapper.client).publish(data);
}