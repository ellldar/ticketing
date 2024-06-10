import { Publisher, Subjects, TicketCreatedEvent } from "@supatai/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	subject: Subjects.TicketCreated = Subjects.TicketCreated;
}