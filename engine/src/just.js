// src/just.js
import { connection } from './database.js';

export const justFunction = () => {
  console.log("This is a linked file using the database connection.");
  return connection;
};