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
const http_client_1 = __importDefault(require("./utils/http-client"));
const cheerio = __importStar(require("cheerio"));
const grammy_1 = require("grammy");
const telegram_bot_1 = __importDefault(require("./services/telegram-bot"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let token;
if (process.env.NODE_ENV === "development") {
    token = process.env.TELEGRAM_BOT_API_TOKEN_DEV;
}
else {
    token = process.env.TELEGRAM_BOT_API_TOKEN_PROD;
}
console.log("asdsad", process.env.NODE_ENV);
const PersianPoemsTelegramBot = new telegram_bot_1.default(token);
const HafezHttpClient = new http_client_1.default("https://ganjoor.net/hafez/");
const HafezHttpClientEn = new http_client_1.default("https://dlwt55w2cx2wh7b2tbrfot54lm0zupfu.lambda-url.eu-north-1.on.aws/");
const enSourceBaseURl = "https://allpoetry.com";
const faSourceBaseUrl = "https://ganjoor.net";
const itemsPerPage = 10;
let listOfPoemsInEnglish = [];
const createLanguageMenu = (ctx) => {
    let keyboard = new grammy_1.InlineKeyboard();
    const textEn = "Welcome to the Hafez Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poet, Hafez.  Enjoy the world of rhythm, rhyme, and profound meaning that is Hafez's poetry.";
    const textFa = "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. لذت ببرید.";
    const finalText = `
    ${textFa}
    ${textEn}
    `;
    keyboard.text("English", "select_language:en");
    keyboard.text("فارسی", "select_language:fa");
    ctx.reply(finalText, {
        reply_markup: keyboard,
    });
};
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
        .url("مطالعه در وبسایت گنجور", `${faSourceBaseUrl}/${randomGhazal.link}`)
        .row();
    keyboard.text("بازگشت", "back:fa").row();
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
        poem += `${item.m1}\n ${item.m2}\n \n`;
    });
    return poem;
});
const extractPoemsTextEn = (ctx, poemUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("asdasds", poemUrl);
        const poem = yield HafezHttpClientEn.getData("", {
            poem_url: poemUrl,
        });
        console.log("asdasdsad", poem);
        if (!poem) {
            throw new Error("Error in fetching poem");
        }
        return poem;
    }
    catch (e) {
        console.log(e);
        createErrorEn(ctx);
    }
});
const createErrorEn = (ctx) => {
    const keyboard = new grammy_1.InlineKeyboard();
    keyboard.text("Back", `hafez_poems:en`);
    ctx.reply("We couldn't fetch the poem at the moment. please try again", {
        reply_markup: keyboard,
    });
};
const showPoem = (ctx, text, link) => __awaiter(void 0, void 0, void 0, function* () {
    // show menu at the end of poem
    let keyboard = new grammy_1.InlineKeyboard();
    keyboard.url("مطالعه در وبسایت گنجور", `https://ganjoor.net${link}`).row();
    keyboard.text("بازگشت", "hafez_poems:fa");
    ctx.reply(text, {
        reply_markup: keyboard,
    });
});
const showPoemEn = (ctx, text, link) => __awaiter(void 0, void 0, void 0, function* () {
    // show menu at the end of poem
    let keyboard = new grammy_1.InlineKeyboard();
    keyboard.url("Read this at AllPoetry", `${link}`).row();
    keyboard.text("Back", "hafez_poems:en");
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
                callback_data: `hafez_poems_select_fa:${item.link}`,
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
            callback_data: `hafez_poems:fa`,
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
function showPageEn(list, ctx, pageNum, editOrReplyToMessage) {
    let start = pageNum * itemsPerPage;
    let itemsToShow = list.slice(start, start + itemsPerPage);
    let keyboard = new grammy_1.InlineKeyboard();
    itemsToShow.forEach((item) => {
        keyboard
            .text(item.text, `p_h_en:${item.href
            .replace("https://allpoetry.com/poem/", "")
            .replace("-by-Hafez-Shirazi", "")}`)
            .row();
    });
    if (pageNum > 0) {
        keyboard.text("⬅️ Previous", `hafez_page_en:${pageNum - 1}`);
    }
    if (start + itemsPerPage < list.length) {
        keyboard.text("Next ➡️", `hafez_page_en:${pageNum + 1}`);
    }
    keyboard.text("Back", `select_language:en`).row();
    if (editOrReplyToMessage === "replyMessage") {
        ctx.reply(`Please select one`, {
            reply_markup: keyboard,
        });
    }
    if (editOrReplyToMessage === "editMessage") {
        ctx.editMessageText(`Please select one`, {
            reply_markup: keyboard,
        });
    }
}
const getHafezPoemsPersian = () => __awaiter(void 0, void 0, void 0, function* () {
    // one button each
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
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
    (_a = PersianPoemsTelegramBot.bot) === null || _a === void 0 ? void 0 : _a.callbackQuery(/select-poet:(\d+)/, (ctx) => {
        const poetId = ctx.match[1];
        switch (getPoetNameById(poetId)) {
            case "Hafez":
                return createHafez(ctx, "editMessage");
            case "Saadi":
                ctx.reply("soon");
            // return createSaadi(ctx, "editMessage");
        }
    });
    (_b = PersianPoemsTelegramBot.bot) === null || _b === void 0 ? void 0 : _b.callbackQuery(/select-poet-new-message:(\d+)/, (ctx) => {
        createHafez(ctx, "replyMessage");
    });
    (_c = PersianPoemsTelegramBot.bot) === null || _c === void 0 ? void 0 : _c.callbackQuery(/go-back-to-poet-list/, (ctx) => {
        createPoetMenuFa(ctx, "editMessage");
    });
    (_d = PersianPoemsTelegramBot.bot) === null || _d === void 0 ? void 0 : _d.callbackQuery(/poet-list-from-new-message/, (ctx) => {
        createPoetMenuFa(ctx, "replyMessage");
    });
    const createPoetMenuFa = (ctx, editOrReply) => {
        const menu = new grammy_1.InlineKeyboard();
        const text = "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. همچنین با استفاده از دستور /poem می توانید شعر روز را دریافت کنید. لذت ببرید.";
        menu.text("اشعار حافظ", "hafez_poems:fa").row();
        menu.text("فال حافظ", "hafez_get_fal").row();
        menu.text("درباره حافظ", "hafez_bio:fa").row();
        menu.text("بازگشت", "hafez_main_menu_back_fa").row();
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
    const createPoetMenuEn = (ctx, editOrReply) => {
        const menu = new grammy_1.InlineKeyboard();
        const text = "Welcome to the Hafez Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poet, Hafez.  Enjoy the world of rhythm, rhyme, and profound meaning that is Hafez's poetry.";
        menu.text("Poems", "hafez_poems:en").row();
        menu.text("About Hafez Shirazi", "hafez_bio:en").row();
        menu.text("back", "back:en").row();
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
    const createHafezEn = (ctx, editOrReply = "replyMessage") => __awaiter(void 0, void 0, void 0, function* () {
        ctx.reply("Fetching the poems list. Please wait few seconds...");
        try {
            listOfPoemsInEnglish = yield HafezHttpClientEn.getData("", {
                author: `Hafez-Shirazi`,
            });
            if (listOfPoemsInEnglish.length === 0) {
                return createErrorEn(ctx);
            }
            showPageEn(listOfPoemsInEnglish, ctx, 0, "replyMessage");
        }
        catch (e) {
            console.log(e);
            createErrorEn(ctx);
        }
    });
    PersianPoemsTelegramBot.addCommandEventListener("start", (ctx) => createLanguageMenu(ctx));
    PersianPoemsTelegramBot.addCommandEventListener("poem", (ctx) => selectAndRenderRandomGhazal(ctx));
    PersianPoemsTelegramBot.addCommandEventListener("fal", (ctx) => selectAndRenderRandomGhazal(ctx));
    (_e = PersianPoemsTelegramBot.bot) === null || _e === void 0 ? void 0 : _e.callbackQuery(/hafez_page:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const pageNum = parseInt(ctx.match[1]);
        const type = ctx.callbackQuery.data.split(":")[2];
        // @ts-ignore
        const list = yield getPoems(type);
        console.log("list", list);
        // @ts-ignore
        showPage(list, ctx, pageNum, "editMessage", type);
    }));
    (_f = PersianPoemsTelegramBot.bot) === null || _f === void 0 ? void 0 : _f.callbackQuery(/hafez_page_en:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const pageNum = parseInt(ctx.match[1]);
        // @ts-ignore
        const list = listOfPoemsInEnglish;
        // @ts-ignore
        showPageEn(list, ctx, pageNum, "editMessage");
    }));
    (_g = PersianPoemsTelegramBot.bot) === null || _g === void 0 ? void 0 : _g.callbackQuery(/hafez_poems_select_fa:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const itemLink = ctx.match[1]; // Extract link from callback data
        const type = ctx.match[1].split("/hafez/")[1];
        const poemText = yield extractPoemsText(type);
        showPoem(ctx, poemText, itemLink);
    }));
    (_h = PersianPoemsTelegramBot.bot) === null || _h === void 0 ? void 0 : _h.callbackQuery(/hafez_ghazal/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghazal");
        showPage(list, ctx, 0, "editMessage", "ghazal");
    }));
    (_j = PersianPoemsTelegramBot.bot) === null || _j === void 0 ? void 0 : _j.callbackQuery(/hafez_ghete/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghete");
        showPage(list, ctx, 0, "editMessage", "ghete");
    }));
    (_k = PersianPoemsTelegramBot.bot) === null || _k === void 0 ? void 0 : _k.callbackQuery(/hafez_robaee2/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("robaee2");
        showPage(list, ctx, 0, "editMessage", "robaee2");
    }));
    (_l = PersianPoemsTelegramBot.bot) === null || _l === void 0 ? void 0 : _l.callbackQuery(/hafez_ghaside/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield getPoems("ghaside");
        showPage(list, ctx, 0, "editMessage", "ghaside");
    }));
    (_m = PersianPoemsTelegramBot.bot) === null || _m === void 0 ? void 0 : _m.callbackQuery(/hafez_masnavi/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const poem = yield extractPoemsText("masnavi");
        showPoem(ctx, poem, "hafez/masnavi");
    }));
    (_o = PersianPoemsTelegramBot.bot) === null || _o === void 0 ? void 0 : _o.callbackQuery(/hafez_saghiname/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const poem = yield extractPoemsText("saghiname");
        showPoem(ctx, poem, "hafez/saghiname");
    }));
    (_p = PersianPoemsTelegramBot.bot) === null || _p === void 0 ? void 0 : _p.callbackQuery(/hafez_bio:fa/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const text = "خواجه شمس‌الدین محمد شیرازی متخلص به «حافظ»، غزلسرای بزرگ و از خداوندان شعر و ادب پارسی است. وی حدود سال ۷۲۶ هجری قمری در شیراز متولد شد. علوم و فنون را در محفل درس استادان زمان فراگرفت و در علوم ادبی عصر پایه‌ای رفیع یافت. خاصه در علوم فقهی و الهی تأمل بسیار کرد و قرآن را با چهارده روایت مختلف از بر داشت. گوته دانشمند بزرگ و شاعر و سخنور مشهور آلمانی دیوان شرقی خود را به نام او و با کسب الهام از افکار وی تدوین کرد. دیوان اشعار او شامل غزلیات، چند قصیده، چند مثنوی، قطعات و رباعیات است. وی به سال ۷۹۲ هجری قمری در شیراز درگذشت. آرامگاه او در حافظیهٔ شیراز زیارتگاه صاحبنظران و عاشقان شعر و ادب پارسی است.    ";
        const keyboard = new grammy_1.InlineKeyboard();
        keyboard
            .url("سایت ویکیپدیا", "https://fa.wikipedia.org/wiki/%D8%AD%D8%A7%D9%81%D8%B8")
            .row()
            .text("بازگشت", "back:fa")
            .row();
        return ctx.reply(text, {
            reply_markup: keyboard,
        });
    }));
    (_q = PersianPoemsTelegramBot.bot) === null || _q === void 0 ? void 0 : _q.callbackQuery(/hafez_bio:en/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const text = `Hafez, whose full name was Khwāja Shams-ud-Dīn Muḥammad Ḥāfeẓ-e Shīrāzī, was a prominent Persian poet of the 14th century. Born in Shiraz, Iran, around 1315, he is known for his profound and lyrical poems that masterfully blend a joyous love for life with a deep spiritual understanding. Hafez's primary poetic form was the ghazal, a short lyric poem that traditionally focuses on themes of love and loss.

    Hafez's work had a significant influence on Persian literature and culture, and he is still revered in Iran and beyond. His book of poetry, Divan-e-Hafez, is a cornerstone of Persian literature, often found in homes and regularly used for special occasions and advice. His poems are marked by their richness of allusion, complexity of language, and exploration of themes like love, spirituality, and the impermanence of life. Hafez is known for his profound wisdom, his biting satire of religious hypocrisy, and his affirmation of the liberating power of love.`;
        const keyboard = new grammy_1.InlineKeyboard();
        keyboard
            .url("Wikipedia", "https://en.wikipedia.org/wiki/Hafez")
            .row()
            .text("back", "select_language:en")
            .row();
        return ctx.reply(text, {
            reply_markup: keyboard,
        });
    }));
    // Callbacks
    (_r = PersianPoemsTelegramBot.bot) === null || _r === void 0 ? void 0 : _r.callbackQuery(/select_language:en/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createPoetMenuEn(ctx, "editMessage");
    }));
    (_s = PersianPoemsTelegramBot.bot) === null || _s === void 0 ? void 0 : _s.callbackQuery(/select_language:fa/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createPoetMenuFa(ctx, "editMessage");
    }));
    (_t = PersianPoemsTelegramBot.bot) === null || _t === void 0 ? void 0 : _t.callbackQuery(/hafez_get_fal/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        selectAndRenderRandomGhazal(ctx);
    }));
    (_u = PersianPoemsTelegramBot.bot) === null || _u === void 0 ? void 0 : _u.callbackQuery(/hafez_poems:fa/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createHafez(ctx, "editMessage");
    }));
    (_v = PersianPoemsTelegramBot.bot) === null || _v === void 0 ? void 0 : _v.callbackQuery(/hafez_poems:en/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createHafezEn(ctx, "editMessage");
    }));
    (_w = PersianPoemsTelegramBot.bot) === null || _w === void 0 ? void 0 : _w.callbackQuery(/p_h_en:(.+)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.reply("Fetching the poem text. Please wait few seconds...");
        const itemLink = `${enSourceBaseURl}/poem/${ctx.match[1]}-by-Hafez-Shirazi`; // Extract link from callback data
        const poemText = yield extractPoemsTextEn(ctx, itemLink);
        if (poemText) {
            showPoemEn(ctx, poemText, `http://allpoetry.com/${itemLink}`);
        }
    }));
    (_x = PersianPoemsTelegramBot.bot) === null || _x === void 0 ? void 0 : _x.callbackQuery(/back:fa/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createPoetMenuFa(ctx, "editMessage");
    }));
    (_y = PersianPoemsTelegramBot.bot) === null || _y === void 0 ? void 0 : _y.callbackQuery(/back:en/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        return createLanguageMenu(ctx);
    }));
    (_z = PersianPoemsTelegramBot.bot) === null || _z === void 0 ? void 0 : _z.callbackQuery(/hafez_main_menu_back_fa/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log(ctx);
        return createLanguageMenu(ctx);
    }));
    PersianPoemsTelegramBot.start();
});
getHafezPoemsPersian();
