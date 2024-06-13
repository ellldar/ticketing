import mongoose from 'mongoose';
import { DatabaseConnectionError } from "@supatai/common";

import { app } from "./app";
const start = async () => {

    console.log('Starting up auth...');

    // Check if process.env.JWT_KEY exists
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }

    // Check if process.env.MONGO_URI exists
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
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