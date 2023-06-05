import HttpClient from "../../utils/http-client";
import * as cheerio from "cheerio";
import { PersianPoemsTelegramBot } from "../..";
import { Context, InlineKeyboard } from "grammy";

const HafezHttpClient = new HttpClient("https://ganjoor.net/hafez/");

const itemsPerPage = 10;

const getPoems = async (
  type: "ghete" | "ghazal" | "robaee2" | "ghaside" | "masnavi"
) => {
  console.log("type", type);
  const htmlPage = await HafezHttpClient.getData(type);
  let $ = cheerio.load(htmlPage);
  // Select the list items and map over them
  let list: any = [];
  $(".poem-excerpt").each(function (i, elem) {
    list[i] = {
      text: $(this).text(),
      link: $(elem).children().attr("href"),
    };
  });

  return list;
};

const extractPoemsText = async (type: any) => {
  console.log("typssse", type);
  const poemHtml = await HafezHttpClient.getData(type);
  console.log(poemHtml);
  let $ = cheerio.load(poemHtml);
  let items: any = [];
  $(".b").each((index, element) => {
    let m1Text = $(element).find(".m1 p").text();
    let m2Text = $(element).find(".m2 p").text();
    items.push({ m1: m1Text, m2: m2Text });
  });
  let poem = "";
  items.forEach((item: any) => {
    poem += `${item.m1}\n \n`;
  });

  return poem;
};

const showPoem = async (ctx: any, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard.url("مطالعه در وبسایت گنجور", `https://ganjoor.net${link}`).row();

  keyboard.text("منوی شعرا", "poet-list-from-new-message");
  keyboard.text(" منوی حافظ شیرازی", "select-poet-new-message:0");

  ctx.reply(text, {
    reply_markup: keyboard,
  });
};

function showPage(
  list: any,
  ctx: Context,
  pageNum: number,
  editOrReplyToMessage: "replyMessage" | "editMessage",
  type: "ghete" | "ghazal" | "robaee2" | "ghaside" | "masnavi"
) {
  let start = pageNum * itemsPerPage;
  let itemsToShow = list.slice(start, start + itemsPerPage);

  let keyboard: any = [];

  itemsToShow.forEach((item: any) => {
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
      text: "بازگشت به منوی شروع",
      callback_data: `go-back-to-poet-list`,
    },
  ]);

  if (editOrReplyToMessage === "replyMessage") {
    ctx.reply(`صفحه ${pageNum + 1}`, {
      reply_markup: {
        inline_keyboard: [keyboard],
      },
    });
  }

  if (editOrReplyToMessage === "editMessage") {
    ctx.editMessageText(`صفحه ${pageNum + 1}`, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
}

const getHafezPoemsPersian = async () => {
  // one button each
  const mainText = "Please select a poet";

  const poets = [
    {
      title: {
        en: "Hafez",
        fa: "خواجه حافظ شیرازی",
      },
      id: "0",
    },
    {
      title: {
        en: "Saadi",
        fa: "سعدی",
      },
      id: "1",
    },
  ];

  PersianPoemsTelegramBot.bot?.callbackQuery(/select-poet:(\d+)/, (ctx) => {
    createHafezMenu(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select-poet-new-message:(\d+)/,
    (ctx) => {
      createHafezMenu(ctx, "replyMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/go-back-to-poet-list/, (ctx) => {
    createPoetMenu(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /poet-list-from-new-message/,
    (ctx) => {
      createPoetMenu(ctx, "replyMessage");
    }
  );

  const createPoetMenu = (
    ctx: Context,
    editOrReply: "editMessage" | "replyMessage"
  ) => {
    const menu = new InlineKeyboard();
    poets.forEach((poet) => {
      menu.text(poet.title.fa, `select-poet:${poet.id}`).row();
    });

    if (editOrReply === "editMessage") {
      return ctx.editMessageText("لطفا شاعر انتخاب کنید", {
        reply_markup: menu,
      });
    }
    if (editOrReply === "replyMessage") {
      console.log("asdsadasdad");
      return ctx.reply("لطفا شاعر انتخاب کنید", {
        reply_markup: menu,
      });
    }
  };

  const createHafezMenu = (
    ctx: Context,
    editOrReply: "editMessage" | "replyMessage" = "replyMessage"
  ) => {
    const newMenu = new InlineKeyboard()
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
      .text("بیوگرافی", "hafez_hafez_bio")
      .row()
      .text("بازگشت به منوی شاعران", "go-back-to-poet-list");

    if (editOrReply === "editMessage") {
      return ctx.editMessageText("منوی حافظ شیرازی", {
        reply_markup: newMenu,
      });
    }
    if (editOrReply === "replyMessage") {
      return ctx.reply("لطفا انتخاب کنید", {
        reply_markup: newMenu,
      });
    }
  };

  PersianPoemsTelegramBot.addCommandEventListener("start", (ctx) =>
    createPoetMenu(ctx, "replyMessage")
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_page:(.+)/, async (ctx) => {
    const pageNum = parseInt(ctx.match[1]);
    const type = ctx.callbackQuery.data.split(":")[2];
    // @ts-ignore
    const list = await getPoems(type);
    // @ts-ignore
    showPage(list, ctx, pageNum, "editMessage", type);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /hafez_poem_select:(.+)/,
    async (ctx) => {
      const itemLink = ctx.match[1]; // Extract link from callback data
      const type = ctx.match[1].split("/hafez/")[1];
      const poemText = await extractPoemsText(type);
      showPoem(ctx, poemText, itemLink);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_ghazal/, async (ctx) => {
    const list = await getPoems("ghazal");
    showPage(list, ctx, 0, "editMessage", "ghazal");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_ghete/, async (ctx) => {
    const list = await getPoems("ghete");
    showPage(list, ctx, 0, "editMessage", "ghete");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_robaee2/, async (ctx) => {
    const list = await getPoems("robaee2");
    showPage(list, ctx, 0, "editMessage", "robaee2");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_ghaside/, async (ctx) => {
    const list = await getPoems("ghaside");
    showPage(list, ctx, 0, "editMessage", "ghaside");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_masnavi/, async (ctx) => {
    const poem = await extractPoemsText("masnavi");
    showPoem(ctx, poem, "hafez/masnavi");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_saghiname/, async (ctx) => {
    const poem = await extractPoemsText("saghiname");
    showPoem(ctx, poem, "hafez/saghiname");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_bio/, async (ctx) => {
    const text =
      "خواجه شمس‌الدین محمد شیرازی متخلص به «حافظ»، غزلسرای بزرگ و از خداوندان شعر و ادب پارسی است. وی حدود سال ۷۲۶ هجری قمری در شیراز متولد شد. علوم و فنون را در محفل درس استادان زمان فراگرفت و در علوم ادبی عصر پایه‌ای رفیع یافت. خاصه در علوم فقهی و الهی تأمل بسیار کرد و قرآن را با چهارده روایت مختلف از بر داشت. گوته دانشمند بزرگ و شاعر و سخنور مشهور آلمانی دیوان شرقی خود را به نام او و با کسب الهام از افکار وی تدوین کرد. دیوان اشعار او شامل غزلیات، چند قصیده، چند مثنوی، قطعات و رباعیات است. وی به سال ۷۹۲ هجری قمری در شیراز درگذشت. آرامگاه او در حافظیهٔ شیراز زیارتگاه صاحبنظران و عاشقان شعر و ادب پارسی است.    ";
    showPoem(ctx, text, "/hafez");
  });

  PersianPoemsTelegramBot.start();
};

export { getHafezPoemsPersian };
