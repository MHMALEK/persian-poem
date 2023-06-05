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
exports.getHafezPoemsPersian = void 0;
const http_client_1 = __importDefault(require("../../utils/http-client"));
const cheerio = __importStar(require("cheerio"));
const __1 = require("../..");
const grammy_1 = require("grammy");
const HafezHttpClient = new http_client_1.default("https://ganjoor.net/hafez/");
const itemsPerPage = 10;
const getPoems = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlPage = yield HafezHttpClient.getData(type);
    let $ = cheerio.load(htmlPage);
    // Select the list items and map over them
    let list = [];
    $(".poem-excerpt").each(function (i, elem) {
        list[i] = {
            text: $(this).text(),
            link: $(elem).children().attr("href"),
        };
    });
    return list;
});
const selectAndRenderRandomGhazal = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield getPoems("ghazal");
    const randomGhazalIndex = Math.floor(Math.random() * list.length);
    const randomGhazal = list[randomGhazalIndex];
    const poemText = yield extractPoemsText(randomGhazal.link.split("/hafez/")[1]);
    const keyboard = new grammy_1.InlineKeyboard();
    keyboard
        .url("مطالعه در وبسایت گنجور", `https://ganjoor.net/${randomGhazal.link}`)
        .row();
    keyboard.text("بازگشت", "back").row();
    const text = `
      <b>${randomGhazal.text} </b>


    ${poemText}
    
    `;
    ctx.reply(text, {
        reply_markup: keyboard,
        parse_mode: "HTML",
    });
});
const extractPoemsText = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const poemHtml = yield HafezHttpClient.getData(type);
    let $ = cheerio.load(poemHtml);
    let items = [];
    $(".b").each((index, element) => {
        let m1Text = $(element).find(".m1 p").text();
        let m2Text = $(element).find(".m2 p").text();
        items.push({ m1: m1Text, m2: m2Text });
    });
    let poem = "";
    items.forEach((item) => {
        poem += `${item.m1}\n \n`;
    });
    return poem;
});
const showPoem = (ctx, text, link) => __awaiter(void 0, void 0, void 0, function* () {
    // show menu at the end of poem
    let keyboard = new grammy_1.InlineKeyboard();
    keyboard.url("مطالعه در وبسایت گنجور", `https://ganjoor.net${link}`).row();
    keyboard.text("بازگشت", "hafez_poems");
    ctx.reply(text, {
        reply_markup: keyboard,
    });
});
function showPage(list, ctx, pageNum, editOrReplyToMessage, type) {
    let start = pageNum * itemsPerPage;
    let itemsToShow = list.slice(start, start + itemsPerPage);
    let keyboard = [];
    itemsToShow.forEach((item) => {
        keyboard.push([
            {
                text: item.text,
                callback_data: `hafez_poem_select:${item.link}`,
            },
        ]);
    });
    if (pageNum > 0) {
        keyboard.push([
            {
                text: "⬅️ Previous",
                callback_data: `hafez_page:${pageNum - 1}:${type}`,
            },
        ]);
    }
    if (start + itemsPerPage < list.length) {
        keyboard.push([
            {
                text: "Next ➡️",
                callback_data: `hafez_page:${pageNum + 1}:${type}`,
            },
        ]);
    }
    keyboard.push([
        {
            text: "بازگشت",
            callback_data: `hafez_poems`,
        },
    ]);
    if (editOrReplyToMessage === "replyMessage") {
        ctx.reply(`اشعار حافظ`, {
            reply_markup: {
                inline_keyboard: [keyboard],
            },
        });
    }
    if (editOrReplyToMessage === "editMessage") {
        ctx.editMessageText(`اشعار حافظ `, {
            reply_markup: {
                inline_keyboard: keyboard,
            },
        });
    }
}
const getHafezPoemsPersian = () => __awaiter(void 0, void 0, void 0, function* () {
    // one button each
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const poets = {
        hafez: {
            title: {
                en: "Hafez",
                fa: "خواجه حافظ شیرازی",
            },
            id: "0",
        },
        saadi: {
            title: {
                en: "Saadi",
                fa: "سعدی",
            },
            id: "1",
        },
    };
    const getPoetNameById = (poetId) => {
        switch (poetId) {
            case "0":
                return "Hafez";
            case "1":
                return "Saadi";
        }
    };
    (_a = __1.PersianPoemsTelegramBot.bot) === null || _a === void 0 ? void 0 : _a.callbackQuery(/select-poet:(\d+)/, (ctx) => {
        const poetId = ctx.match[1];
        switch (getPoetNameById(poetId)) {
            case "Hafez":
                return createHafez(ctx, "editMessage");
            case "Saadi":
                ctx.reply("soon");
            // return createSaadi(ctx, "editMessage");
        }
    });
    (_b = __1.PersianPoemsTelegramBot.bot) === null || _b === void 0 ? void 0 : _b.callbackQuery(/select-poet-new-message:(\d+)/, (ctx) => {
        createHafez(ctx, "replyMessage");
    });
    (_c = __1.PersianPoemsTelegramBot.bot) === null || _c === void 0 ? void 0 : _c.callbackQuery(/go-back-to-poet-list/, (ctx) => {
        createPoetMenu(ctx, "editMessage");
    });
    (_d = __1.PersianPoemsTelegramBot.bot) === null || _d === void 0 ? void 0 : _d.callbackQuery(/poet-list-from-new-message/, (ctx) => {
        createPoetMenu(ctx, "replyMessage");
    });
    const createPoetMenu = (ctx, editOrReply) => {
        const menu = new grammy_1.InlineKeyboard();
        const text = "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. همچنین با استفاده از دستور /poem می توانید شعر روز را دریافت کنید. لذت ببرید.";
        menu.text("اشعار حافظ", "hafez_poems").row();
        menu.text("فال حافظ", "hafez_get_fal").row();
        menu.text("درباره حافظ", "hafez_bio").row();
        if (editOrReply === "editMessage") {
            return ctx.editMessageText(text, {
                reply_markup: menu,
            });
        }
        if (editOrReply === "replyMessage") {
            return ctx.reply(text, {
                reply_markup: menu,
            });
        }
    };
    const createHafez = (ctx, editOrReply = "replyMessage") => {
        const newMenu = new grammy_1.InlineKeyboard()
            .text("غزلیات", "hafez_ghazal")
            .row()
            .text("رباعیات", "hafez_robaee2")
            .row()
            .text("قطعات", "hafez_ghete")
            .row()
            .text("قصاید", "hafez_ghaside")
            .row()
            .text("مثنوی", "hafez_masnavi")
            .row()
            .text("ساقی نامه", "hafez_saghiname")
            .row()
            .text("بازگشت", "go-back-to-poet-list");
        if (editOrReply === "editMessage") {
            return ctx.editMessageText("لطفا یک مورد را انتخاب نمایید", {
                reply_markup: newMenu,
            });
        }
        if (editOrReply === "replyMessage") {
            return ctx.reply("لطفا یک مورد انتخاب کنید", {
                reply_markup: newMenu,
            });
        }
    };
    __1.PersianPoemsTelegramBot.addCommandEventListener("start", (ctx) => createPoetMenu(ctx, "replyMessage"));
    __1.PersianPoemsTelegramBot.addCommandEventListener("poem", (ctx) => selectAndRenderRandomGhazal(ctx));
    __1.PersianPoemsTelegramBot.addCommandEventListener("fal", (ctx) => selectAndRenderRandomGhazal(ctx));
    (_e = __1.PersianPoemsTelegramBot.bot) === null || _e === void 0 ? void 0 : _e.callbackQuery(/hafez_page:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const pageNum = parseInt(ctx.match[1]);
        const type = ctx.callbackQuery.data.split(":")[2];
        // @ts-ignore
        const list = yield getPoems(type);
        // @ts-ignore
        showPage(list, ctx, pageNum, "editMessage", type);
    }));
    (_f = __1.PersianPoemsTelegramBot.bot) === null || _f === void 0 ? void 0 : _f.callbackQuery(/hafez_poem_select:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const itemLink = ctx.match[1]; // Extract link from callback data
        const type = ctx.match[1].split("/hafez/")[1];
        const poemText = yield extractPoemsText(type);
        showPoem(ctx, poemText, itemLink);
    }));
    (_g = __1.PersianPoemsTelegramBot.bot) === null || _g === void 0 ? void 0 : _g.callbackQuery(/hafez_ghazal/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghazal");
        showPage(list, ctx, 0, "editMessage", "ghazal");
    }));
    (_h = __1.PersianPoemsTelegramBot.bot) === null || _h === void 0 ? void 0 : _h.callbackQuery(/hafez_ghete/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghete");
        showPage(list, ctx, 0, "editMessage", "ghete");
    }));
    (_j = __1.PersianPoemsTelegramBot.bot) === null || _j === void 0 ? void 0 : _j.callbackQuery(/hafez_robaee2/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("robaee2");
        showPage(list, ctx, 0, "editMessage", "robaee2");
    }));
    (_k = __1.PersianPoemsTelegramBot.bot) === null || _k === void 0 ? void 0 : _k.callbackQuery(/hafez_ghaside/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghaside");
        showPage(list, ctx, 0, "editMessage", "ghaside");
    }));
    (_l = __1.PersianPoemsTelegramBot.bot) === null || _l === void 0 ? void 0 : _l.callbackQuery(/hafez_masnavi/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const poem = yield extractPoemsText("masnavi");
        showPoem(ctx, poem, "hafez/masnavi");
    }));
    (_m = __1.PersianPoemsTelegramBot.bot) === null || _m === void 0 ? void 0 : _m.callbackQuery(/hafez_saghiname/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const poem = yield extractPoemsText("saghiname");
        showPoem(ctx, poem, "hafez/saghiname");
    }));
    (_o = __1.PersianPoemsTelegramBot.bot) === null || _o === void 0 ? void 0 : _o.callbackQuery(/hafez_bio/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const text = "خواجه شمس‌الدین محمد شیرازی متخلص به «حافظ»، غزلسرای بزرگ و از خداوندان شعر و ادب پارسی است. وی حدود سال ۷۲۶ هجری قمری در شیراز متولد شد. علوم و فنون را در محفل درس استادان زمان فراگرفت و در علوم ادبی عصر پایه‌ای رفیع یافت. خاصه در علوم فقهی و الهی تأمل بسیار کرد و قرآن را با چهارده روایت مختلف از بر داشت. گوته دانشمند بزرگ و شاعر و سخنور مشهور آلمانی دیوان شرقی خود را به نام او و با کسب الهام از افکار وی تدوین کرد. دیوان اشعار او شامل غزلیات، چند قصیده، چند مثنوی، قطعات و رباعیات است. وی به سال ۷۹۲ هجری قمری در شیراز درگذشت. آرامگاه او در حافظیهٔ شیراز زیارتگاه صاحبنظران و عاشقان شعر و ادب پارسی است.    ";
        const keyboard = new grammy_1.InlineKeyboard();
        keyboard
            .url("سایت ویکیپدیا", "https://fa.wikipedia.org/wiki/%D8%AD%D8%A7%D9%81%D8%B8")
            .row()
            .text("بازگشت", "back")
            .row();
        return ctx.reply(text, {
            reply_markup: keyboard,
        });
    }));
    (_p = __1.PersianPoemsTelegramBot.bot) === null || _p === void 0 ? void 0 : _p.callbackQuery(/hafez_get_fal/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        selectAndRenderRandomGhazal(ctx);
    }));
    (_q = __1.PersianPoemsTelegramBot.bot) === null || _q === void 0 ? void 0 : _q.callbackQuery(/hafez_poems/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createHafez(ctx, "editMessage");
    }));
    (_r = __1.PersianPoemsTelegramBot.bot) === null || _r === void 0 ? void 0 : _r.callbackQuery(/back/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createPoetMenu(ctx, "editMessage");
    }));
    __1.PersianPoemsTelegramBot.start();
});
exports.getHafezPoemsPersian = getHafezPoemsPersian;
