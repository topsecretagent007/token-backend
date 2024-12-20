"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const StringSchema = new mongoose_1.default.Schema({
    key: { type: String, required: true, unique: true },
});
const StringModel = mongoose_1.default.model("String", StringSchema);
exports.default = StringModel;
