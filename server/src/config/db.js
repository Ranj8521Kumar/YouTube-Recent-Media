/**
 * Database Configuration Module
 *
 * This module handles the connection to MongoDB using Mongoose.
 * It reads the MongoDB URI from environment variables and
 * establishes a connection with appropriate options.
 *
 * @module config/db
 */

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB
 *
 * Establishes a connection to the MongoDB database using the URI
 * specified in the MONGODB_URI environment variable.
 *
 * @async
 * @function connectDB
 * @returns {Promise<mongoose.Connection>} Mongoose connection object
 * @throws {Error} If connection fails, exits the process with code 1
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
