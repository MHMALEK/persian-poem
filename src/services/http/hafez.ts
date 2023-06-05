import HttpClient from "../../utils/http-client";
import * as cheerio from "cheerio";
import { PersianPoemsTelegramBot } from "../..";
import { Context, InlineKeyboard } from "grammy";

const HafezHttpClient = new HttpClient("https://ganjoor.net/hafez/");

const itemsPerPage = 10;

const getPoems = async (
  type: "ghete" | "ghazal" | "robaee2" | "ghaside" | "masnavi"
) => {
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

const selectAndRenderRandomGhazal = async (ctx: Context) => {
  const list = await getPoems("ghazal");
  const randomGhazalIndex = Math.floor(Math.random() * list.length);
  const randomGhazal = list[randomGhazalIndex];

  const poemText = await extractPoemsText(
    randomGhazal.link.split("/hafez/")[1]
  );

  const keyboard = new InlineKeyboard();
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
};

const extractPoemsText = async (type: any) => {
  const poemHtml = await HafezHttpClient.getData(type);
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

  keyboard.text("بازگشت", "hafez_poems");

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

const getHafezPoemsPersian = async () => {
  // one button each

  const poets: {
    [x: string]: {
      title: {
        en: string;
        fa: string;
      };
      id: string;
    };
  } = {
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

  const getPoetNameById = (poetId: string) => {
    switch (poetId) {
      case "0":
        return "Hafez";
      case "1":
        return "Saadi";
    }
  };

  PersianPoemsTelegramBot.bot?.callbackQuery(/select-poet:(\d+)/, (ctx) => {
    const poetId = ctx.match[1];
    switch (getPoetNameById(poetId)) {
      case "Hafez":
        return createHafez(ctx, "editMessage");
      case "Saadi":
        ctx.reply("soon");
      // return createSaadi(ctx, "editMessage");
    }
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select-poet-new-message:(\d+)/,
    (ctx) => {
      createHafez(ctx, "replyMessage");
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

    const text =
      "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. همچنین با استفاده از دستور /poem می توانید شعر روز را دریافت کنید. لذت ببرید.";

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

  const createHafez = (
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

  PersianPoemsTelegramBot.addCommandEventListener("start", (ctx) =>
    createPoetMenu(ctx, "replyMessage")
  );

  PersianPoemsTelegramBot.addCommandEventListener("poem", (ctx) =>
    selectAndRenderRandomGhazal(ctx)
  );

  PersianPoemsTelegramBot.addCommandEventListener("fal", (ctx) =>
    selectAndRenderRandomGhazal(ctx)
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
    const keyboard = new InlineKeyboard();
    keyboard
      .url(
        "سایت ویکیپدیا",
        "https://fa.wikipedia.org/wiki/%D8%AD%D8%A7%D9%81%D8%B8"
      )
      .row()
      .text("بازگشت", "back")
      .row();

    return ctx.reply(text, {
      reply_markup: keyboard,
    });
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_get_fal/, async (ctx) => {
    selectAndRenderRandomGhazal(ctx);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_poems/, async (ctx) => {
    return createHafez(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/back/, async (ctx) => {
    return createPoetMenu(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.start();
};

export { getHafezPoemsPersian };
