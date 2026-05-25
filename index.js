import express from "express";
import cors from "cors";
import { collectionName, connection } from "./dbConfig.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://todo-frontend-sable-zeta.vercel.app",
    credentials: true,
  }),
);
app.use(cookieParser());

app.post("/login", async (req, resp) => {
  const userData = req.body;

  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.findOne({
      email: userData.email,
      password: userData.password,
    });

    if (result) {
      jwt.sign(
        userData,
        process.env.JWT_SECRET,
        { expiresIn: "5d" },
        (error, token) => {
          resp.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          });
          resp.send({
            message: "Login successful",
            success: true,
            token,
          });
        },
      );
    } else {
      resp.send({
        message: "Invalid credentials",
        success: false,
      });
    }
  } else {
    resp.send({
      message: "Invalid data",
      success: false,
    });
  }
});

app.post("/signup", async (req, resp) => {
  const userData = req.body;

  if (userData.email && userData.password) {
    const db = await connection();
    const collection = await db.collection("users");
    const result = await collection.insertOne(userData);

    if (result) {
      jwt.sign(
        userData,
        process.env.JWT_SECRET,
        { expiresIn: "5d" },
        (error, token) => {
          resp.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          });
          resp.send({
            message: "Signup successful",
            success: true,
            token,
          });
        },
      );
    }
  } else {
    resp.send({
      message: "Invalid data",
      success: false,
    });
  }
});

app.post("/add-task", verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);

  const result = await collection.insertOne(req.body);
  if (result) {
    resp.send({
      message: "new task added",
      success: true,
      result,
    });
  } else {
    resp.send({
      message: "task not added",
      success: false,
    });
  }
});

app.get("/tasks", verifyJwtToken, async (req, resp) => {
  const db = await connection();

  const collection = db.collection(collectionName);
  const result = await collection.find().toArray();

  if (result) {
    resp.send({
      message: "Data fetched",
      success: true,
      result,
    });
  } else {
    resp.send({
      message: "Error: try after sometime",
      success: false,
    });
  }
});

app.get("/task/:id", verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = db.collection(collectionName);
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });

  if (result) {
    resp.send({
      message: "Task fetched",
      success: true,
      result,
    });
  } else {
    resp.send({
      message: "Error: try after sometime",
      success: false,
    });
  }
});

app.put("/update-task", verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);

  const { _id, ...fields } = req.body;

  const update = { $set: fields };

  console.log(fields);

  const result = await collection.updateOne({ _id: new ObjectId(_id) }, update);

  if (result) {
    resp.send({
      message: "Data updated",
      success: true,
    });
  } else {
    resp.send({
      message: "Error: try after sometime",
      success: false,
    });
  }
});

app.delete("/delete/:id", verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const id = req.params.id;
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result) {
    resp.send({
      message: "Data delete",
      success: true,
    });
  } else {
    resp.send({
      message: "Error: try after sometime",
      success: false,
    });
  }
});

app.delete("/delete-multiple", verifyJwtToken, async (req, resp) => {
  const db = await connection();
  const collection = await db.collection(collectionName);
  const ids = req.body;

  const objectIds = ids.map((id) => new ObjectId(id));

  const result = await collection.deleteMany({ _id: { $in: objectIds } });
  if (result) {
    resp.send({
      message: "Data delete",
      success: true,
      result,
    });
  } else {
    resp.send({
      message: "Error: try after sometime",
      success: false,
    });
  }
});

function verifyJwtToken(req, resp, next) {
  // console.log("cookies Test",req.cookies['token']);
  const token = req.headers.authorization
  if (!token) {
    return resp.send({
      message: "No token provided",
      success: false,
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      resp.send({
        message: "Invalid token",
        success: false,
      });
    }
    console.log("Decoded data", decoded);
    next();
  });
}

const PORT = process.env.PORT || 3200;

app.listen(PORT,()=>{
  console.log("Server running on port", PORT);
  
});
