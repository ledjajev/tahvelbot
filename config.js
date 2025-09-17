import dotenv from "dotenv";
dotenv.config();

export const DB_FILENAME = process.env.DB_FILENAME;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const TAHVELTP_BACKEND = process.env.TAHVELTP_BACKEND;
export const RATE_LIMIT = process.env.RATE_LIMIT;
export const WINDOW_MS = process.env.WINDOW_MS;