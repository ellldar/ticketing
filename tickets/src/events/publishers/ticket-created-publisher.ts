import { Publisher, Subjects, TicketCreatedEvent } from '@supatai/common';
import { natsWrapper } from "../../nats-wrapper";

class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

export const ticketCreatedPublisher = async (data: TicketCreatedEvent['data']) => {
	return await new TicketCreatedPublisher(natsWrapper.client).publish(data);
}