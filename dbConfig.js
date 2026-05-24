import {MongoClient} from "mongodb"

const dbName="mern-todo";
export const collectionName = "todoData";
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

export const connection = async () => {
  const connect = await client.connect();
  return await connect.db(dbName);
};