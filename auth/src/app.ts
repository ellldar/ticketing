// @ts-ignore
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
// @ts-ignore
import cookieSession from 'cookie-session';

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

import { errorHandler, NotFoundError } from "@supatai/common";

const app = express();
app.set('trust proxy', true);   // To allow Ingress-Nginx proxying traffic over HTTPS
app.use(json());
app.use(
    cookieSession({
        signed: false,                              // This turns off encryption, since JWT is already encrypted
        secure: process.env.NODE_ENV !== 'test'     // Means that user is using an HTTPS connection
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// In case someone makes a request on '/api/users' which is empty
app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };