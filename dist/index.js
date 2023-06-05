"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersianPoemsTelegramBot = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const hafez_1 = __importDefault(require("./api/poems/routes/hafez"));
const telegram_bot_1 = __importDefault(require("./services/telegram-bot"));
const hafez_2 = require("./services/http/hafez");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.get("/", (req, res) => {
    res.send("Express Server");
});
app.get("/hafez", hafez_1.default);
const PersianPoemsTelegramBot = new telegram_bot_1.default(process.env.TELEGRAM_BOT_API_TOKEN);
exports.PersianPoemsTelegramBot = PersianPoemsTelegramBot;
(0, hafez_2.getHafezPoemsPersian)();
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at 
http://localhost:${port}`);
});
exports.default = app;
