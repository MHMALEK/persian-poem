import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import hafezController from "./api/poems/routes/hafez";
import TelegramBot from "./services/telegram-bot";
import { Menu } from "@grammyjs/menu";
import { getHafezPoemsAPI } from "./services/http/hafez";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("Express Server");
});

app.get("/hafez", hafezController);

const PersianPoemsTelegramBot = new TelegramBot(
  process.env.TELEGRAM_BOT_API_TOKEN as string
);

getHafezPoemsAPI();

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at 
http://localhost:${port}`);
});

export { PersianPoemsTelegramBot };
export default app;
