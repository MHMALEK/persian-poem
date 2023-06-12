import { Context, InlineKeyboard } from "grammy";
import connectToDB from "./services/db";
import PersianPoemsTelegramBot from "./services/telegram-bot";
import { addHafezEnCallbacks } from "./poets/hafez/en";
import { addHafezFaCallbacks } from "./poets/hafez/fa";
import { addDefaultCommands } from "./commands";
import {
  addSelectLanguagesCallback,
  addSelectPoetCallbacks,
} from "./shared/commands";
import { addkhayamFaCallbacks } from "./poets/khayyam/fa";

const dbUrl = process.env.MANGO_DB_URL;
connectToDB(dbUrl as string);

addDefaultCommands();

// callbacks

addSelectLanguagesCallback();
addSelectPoetCallbacks();
addHafezFaCallbacks();
addHafezEnCallbacks();
addkhayamFaCallbacks();

PersianPoemsTelegramBot.start();
