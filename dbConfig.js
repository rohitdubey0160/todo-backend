import {MongoClient} from "mongodb"
import dotenv from "dotenv";

dotenv.config();

const dbName="mern-todo";
export const collectionName = "todoData";
const url = process.env.MONGO_URL;

const client = new MongoClient(url);

export const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};