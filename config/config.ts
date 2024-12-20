import dotenv from "dotenv";
dotenv.config();

try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

export const MONGO_URL = `mongodb+srv://admin:ZoBuGBL5CDk88mNs@solprice.1dbxx.mongodb.net/?retryWrites=true&w=majority&appName=solPrice`;
export const PORT = 5551