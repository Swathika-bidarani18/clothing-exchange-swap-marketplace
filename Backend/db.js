const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is missing from .env");
            return false;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully!");
        return true;

    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        return false;
    }
};

module.exports = connectDB;