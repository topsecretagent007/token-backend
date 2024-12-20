import mongoose from "mongoose";

const StringSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
});

const StringModel = mongoose.model("String", StringSchema);

export default StringModel;
