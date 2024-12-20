import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import StringModel from "./model/UserModel";

import { PORT, connectMongoDB } from "./config";
import http from "http";

const rpcUrl: any = process.env.RPC;

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

// Set up Cross-Origin Resource Sharing (CORS) options
const whitelist = [
  "http://localhost:5000",
  "https://explorer.mctoken.xyz"
];
const corsOptions = {
  origin: whitelist,
  credentials: false,
  sameSite: "none",
};
app.use(cors(corsOptions));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

// Define routes for different API endpoints
app.post("/api/getPrice", async (req, res) => {
  try {
    if (!req.body) {
      console.log("newString ==> return")
      return res.status(400).json({});
    }

    const newString = new StringModel(req.body);
    console.log("newString ==> ", newString)

    await newString.save();

    return res.status(200).json({});

  } catch (err) {
    console.log(err);
    return res.status(500).json({});
  }
});

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Backend Server is Running now!");
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
