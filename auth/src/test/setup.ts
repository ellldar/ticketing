import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

// declare global {
//     namespace NodeJS {
//         export interface Global {
//             signup(): Promise<string[]>;
//         }
//     }
// }

//  Another option in case I run into an error that looks like this:
//  Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.ts(7017)
 declare global {
     var signup: () => Promise<string[]>;
 }

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signup = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({ email, password })
        .expect(201);

    return response.get('Set-Cookie') || null;      // We are returning a cookie
};