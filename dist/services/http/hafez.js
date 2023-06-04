"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHafezPoemsAPI = void 0;
const http_client_1 = __importDefault(require("../../utils/http-client"));
const cheerio = __importStar(require("cheerio"));
const __1 = require("../..");
const grammy_1 = require("grammy");
const HafezHttpClient = new http_client_1.default("https://ganjoor.net/hafez/");
const getHafezPoemsAPI = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const ghazalsList = yield HafezHttpClient.getData("/ghazal");
    let $ = cheerio.load(ghazalsList);
    // Select the list items and map over them
    let items = [];
    $(".poem-excerpt").each(function (i, elem) {
        items[i] = { text: $(this).text(), link: $(elem).children().attr("href") };
    });
    const itemsPerPage = 10;
    //   PersianPoemsTelegramBot.bot?.command("start", (ctx) => showPage(ctx, 0));
    (_a = __1.PersianPoemsTelegramBot.bot) === null || _a === void 0 ? void 0 : _a.callbackQuery(/ghazal:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("asdasd", ctx.match[1]);
        let itemLink = ctx.match[1]; // Extract link from callback data
        // await ctx.answerCallbackQuery();
        const ghazalItem = yield HafezHttpClient.getData(ctx.match[1].split("/hafez/")[1]);
        let $ = cheerio.load(ghazalItem);
        let items = [];
        $(".b").each((index, element) => {
            let m1Text = $(element).find(".m1 p").text();
            let m2Text = $(element).find(".m2 p").text();
            items.push({ m1: m1Text, m2: m2Text });
        });
        let replyMessage = "";
        items.forEach((item, index) => {
            replyMessage += `${item.m1}\n \n`;
        });
        replyMessage += `https://ganjoor.net${itemLink}`;
        ctx.reply(replyMessage);
    }));
    function showPage(ctx, pageNum, editOrReplyToMessage) {
        let start = pageNum * itemsPerPage;
        let itemsToShow = items.slice(start, start + itemsPerPage);
        let keyboard = new grammy_1.InlineKeyboard();
        itemsToShow.forEach((item, index) => {
            keyboard.text(item.text, `ghazal:${item.link}`).row();
        });
        keyboard.row();
        if (pageNum > 0) {
            keyboard.text("⬅️ Previous", `page:${pageNum - 1}`);
        }
        if (start + itemsPerPage < items.length) {
            keyboard.text("Next ➡️", `page:${pageNum + 1}`);
        }
        if (editOrReplyToMessage === "replyMessage") {
            ctx.reply(`صفحه ${pageNum + 1}`, { reply_markup: keyboard });
        }
        if (editOrReplyToMessage === "editMessage") {
            ctx.editMessageText(`صفحه ${pageNum + 1}`, { reply_markup: keyboard });
        }
    }
    __1.PersianPoemsTelegramBot.addCommandEventListener("hafez_ghazal", (ctx) => showPage(ctx, 0, "replyMessage"));
    (_b = __1.PersianPoemsTelegramBot.bot) === null || _b === void 0 ? void 0 : _b.callbackQuery(/page:(\d+)/, (ctx) => {
        let pageNum = parseInt(ctx.match[1]);
        return showPage(ctx, pageNum, "editMessage");
    });
    __1.PersianPoemsTelegramBot.start();
});
exports.getHafezPoemsAPI = getHafezPoemsAPI;
