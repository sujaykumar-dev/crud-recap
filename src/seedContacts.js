import mongoose from "mongoose";
import dotenv from "dotenv";
import { Contact } from "../src/models/contacts.model.js"; // adjust path
import connectDB from "../src/db/index.js"; // adjust path

dotenv.config();

const userId = "696fb2895b19948af8521dec";

const seedContacts = async () => {
  try {
    await connectDB();

    const contacts = [];

    for (let i = 1; i <= 30; i++) {
      contacts.push({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        phone: `90000000${i}`,
        owner: userId,
        isDeleted: false
      });
    }

    await Contact.insertMany(contacts);

    console.log("20 contacts inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedContacts();
