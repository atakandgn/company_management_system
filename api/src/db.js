const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ete_technology"; 

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB using Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); 
  }
};

const closeDatabaseConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection", error);
  }
};

module.exports = { connectToDatabase, closeDatabaseConnection };
