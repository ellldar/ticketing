import mongoose from 'mongoose';
import { CheckEnvVariables, DatabaseConnectionError } from "@supatai/common";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCancelledListener, OrderCreatedListener } from "./events";

const start = async () => {

    console.log('Starting tickets...');

    CheckEnvVariables();

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID!,
            process.env.NATS_CLIENT_ID!,
            process.env.NATS_URL!
        );

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

    } catch (err) {
        console.error(err);
        throw new Error('NATS connection failed!');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB!');
    } catch (err) {
        console.log(typeof err);
        throw new DatabaseConnectionError(JSON.stringify(err));
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!");
    });
};

start();