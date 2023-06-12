import * as cheerio from "cheerio";
import { Context, InlineKeyboard } from "grammy";
import { saveAnalyticsEvent } from "../../../services/analytics";
import {
  extractPoemsText,
  fetchHtmlPageFromGanjoor,
  getPoems,
  loadHtml,
} from "../../../services/ganjoor-crawler";
import PersianPoemsTelegramBot from "../../../services/telegram-bot";
import { createLanguageMenu } from "../../../shared/commands";
const config = {
  pagination: {
    itemPerPage: 10,
  },
  wikiPediaUrl: "https://fa.wikipedia.org/wiki/%D8%AE%DB%8C%D8%A7%D9%85",
  sourceBaseUrl: "https://ganjoor.net/khayyam",
};

const showBio = (ctx: Context) => {
  const text =
    "حکیم ابوالفتح عمربن ابراهیم الخیامی مشهور به «خیام» فیلسوف و ریاضیدان و منجم و شاعر ایرانی در سال ۴۳۹ هجری قمری در نیشابور زاده شد. وی در ترتیب رصد ملکشاهی و اصلاح تقویم جلالی همکاری داشت. وی اشعاری به زبان پارسی و تازی و کتابهایی نیز به هر دو زبان دارد. از آثار او در ریاضی و جبر و مقابله رساله فی شرح ما اشکل من مصادرات کتاب اقلیدس، رساله فی الاحتیال لمعرفه مقداری الذهب و الفضه فی جسم مرکب منهما، و لوازم الامکنه را می‌توان نام برد. وی به سال ۵۲۶ هجری قمری درگذشت. رباعیات او شهرت جهانی دارد.  ";
  const keyboard = new InlineKeyboard();
  keyboard
    .url("سایت ویکیپدیا", config.wikiPediaUrl)
    .row()
    .text("بازگشت", "back_to_main_khayam:fa")
    .row();

  return ctx.reply(text, {
    reply_markup: keyboard,
  });
};

const showPoem = async (ctx: Context, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard.url("مطالعه در وبسایت گنجور", `https://ganjoor.net${link}`).row();

  keyboard.text("بازگشت", "khayam_poems:fa");

  ctx.reply(text, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
};

const showPage = (
  list: any,
  ctx: Context,
  pageNum: number,
  editOrReplyToMessage: "replyMessage" | "editMessage",
  type: string
) => {
  let start = pageNum * config.pagination.itemPerPage;
  let itemsToShow = list.slice(start, start + config.pagination.itemPerPage);

  let keyboard: any = [];

  itemsToShow.forEach((item: any) => {
    keyboard.push([
      {
        text: item.text,
        callback_data: `khayam_poems_select_fa:${item.link}`,
      },
    ]);
  });

  if (pageNum > 0) {
    keyboard.push([
      {
        text: "⬅️ Previous",
        callback_data: `khayam_page:${pageNum - 1}:${type}`,
      },
    ]);
  }

  if (start + config.pagination.itemPerPage < list.length) {
    keyboard.push([
      {
        text: "Next ➡️",
        callback_data: `khayam_page:${pageNum + 1}:${type}`,
      },
    ]);
  }

  keyboard.push([
    {
      text: "بازگشت",
      callback_data: `khayam_poems:fa`,
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
};

const createKhayamMenuFa = (
  ctx: Context,
  editOrReply: "editMessage" | "replyMessage"
) => {
  const menu = new InlineKeyboard();

  const text =
    "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای خیام را بخوانید.";

  menu.text("اشعار خیام", "khayam_poems:fa").row();
  menu.text("درباره خیام", "khayam_bio:fa").row();
  menu.text("بازگشت", "khayam_main_menu_back_fa").row();

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

const createKhayam = (
  ctx: Context,
  editOrReply: "editMessage" | "replyMessage" = "replyMessage"
) => {
  const newMenu = new InlineKeyboard()

    .text("رباعیات", "khayam_robaee")
    .row()

    .text("بازگشت", "go-back-to-khayyam-list");

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

const addkhayamFaCallbacks = () => {
  // callbacks
  PersianPoemsTelegramBot.bot?.callbackQuery(
    /khayam_page:(.+)/,
    async (ctx) => {
      const pageNum = parseInt(ctx.match[1]);
      saveAnalyticsEvent(ctx, `khayam_page:${pageNum}`);

      const type = ctx.callbackQuery.data.split(":")[2];
      const htmlPage = await fetchHtmlPageFromGanjoor("khayyam", "robaee");
      const list = await getPoems(htmlPage);

      showPage(list, ctx, pageNum, "editMessage", type);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /khayam_poems_select_fa:(.+)/,
    async (ctx) => {
      const itemLink = ctx.match[1]; // Extract link from callback data
      const type = ctx.match[1].split("/khayyam/")[1];
      saveAnalyticsEvent(ctx, `khayam_poems_select_fa:${type}`);

      const htmlPage = await fetchHtmlPageFromGanjoor("khayyam", type);

      const poemText = await extractPoemsText(htmlPage);
      showPoem(ctx, poemText, itemLink);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/khayam_robaee/, async (ctx) => {
    const htmlPage = await fetchHtmlPageFromGanjoor("khayyam", "robaee");
    const list = await getPoems(htmlPage);
    saveAnalyticsEvent(ctx, "khayam_robaee");

    showPage(list, ctx, 0, "editMessage", "robaee2");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/khayam_bio:fa/, async (ctx) => {
    saveAnalyticsEvent(ctx, "khayam_bio");
    showBio(ctx);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/khayam_poems:fa/, async (ctx) => {
    saveAnalyticsEvent(ctx, "khayam_poems:fa");

    return createKhayam(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/back:fa/, async (ctx) => {
    saveAnalyticsEvent(ctx, "back:fa");

    return createKhayamMenuFa(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /khayam_main_menu_back_fa/,
    async (ctx) => {
      saveAnalyticsEvent(ctx, "khayam_main_menu_back_fa");

      console.log(ctx);
      return createLanguageMenu(ctx);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /go-back-to-khayyam-list/,
    async (ctx) => {
      saveAnalyticsEvent(ctx, "go-back-to-khayyam-list");

      console.log(ctx);
      return createKhayamMenuFa(ctx, "editMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /back_to_main_khayam/,
    async (ctx) => {
      saveAnalyticsEvent(ctx, "back_to_main_khayam");

      console.log(ctx);
      return createKhayamMenuFa(ctx, "editMessage");
    }
  );
};

export {
  showPoem,
  showPage,
  createKhayamMenuFa,
  createKhayam,
  addkhayamFaCallbacks,
  config,
};
