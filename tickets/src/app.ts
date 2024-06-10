import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from "@supatai/common";
import { createTicketRouter, showTicketRouter, listTicketRouter, updateTicketRouter } from "./routes";

const app = express();
app.set('trust proxy', true);                       // To allow Ingress-Nginx proxying traffic over HTTPS
app.use(json());
app.use(
    cookieSession({
        signed: false,                              // This turns off encryption, since JWT is already encrypted
        secure: process.env.NODE_ENV !== 'test'     // Means that user is using an HTTPS connection
    })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(listTicketRouter);
app.use(updateTicketRouter);

// In case someone makes a request on '/api/users' which is empty
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };