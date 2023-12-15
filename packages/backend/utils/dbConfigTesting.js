import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const initialiseMongoServer = async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.connect(mongoUri);

    mongoose.connection.on("error", (error) => {
        if (error.message.code === "ETIMEDOUT") {
            console.log(error);
            mongoose.connect(mongoUri);
        }
        console.log(error);
    });

    mongoose.connection.once("open", () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
    });
};

export default initialiseMongoServer;
