import HttpClient from "./utils/http-client";
import * as cheerio from "cheerio";
import { Context, InlineKeyboard } from "grammy";
import axios from "axios";
import TelegramBot from "./services/telegram-bot";
import * as dotenv from "dotenv";

dotenv.config();

const PersianPoemsTelegramBot = new TelegramBot(
  process.env.TELEGRAM_BOT_API_TOKEN as string
);

const HafezHttpClient = new HttpClient("https://ganjoor.net/hafez/");

const HafezHttpClientEn = new HttpClient(
  "https://dlwt55w2cx2wh7b2tbrfot54lm0zupfu.lambda-url.eu-north-1.on.aws/"
);

const enSourceBaseURl = "https://allpoetry.com";

const faSourceBaseUrl = "https://ganjoor.net";

const itemsPerPage = 10;

let listOfPoemsInEnglish: any = [];

const createLanguageMenu = (ctx: Context) => {
  let keyboard = new InlineKeyboard();

  const textEn =
    "Welcome to the Hafez Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poet, Hafez.  Enjoy the world of rhythm, rhyme, and profound meaning that is Hafez's poetry.";

  const textFa =
    "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. لذت ببرید.";

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

const extractPoemsTextEn = async (ctx: Context, poemUrl: string) => {
  try {
    console.log("asdasds", poemUrl);
    const poem = await HafezHttpClientEn.getData("", {
      poem_url: poemUrl,
    });
    console.log("asdasdsad", poem);
    if (!poem) {
      throw new Error("Error in fetching poem");
    }
    return poem;
  } catch (e) {
    console.log(e);
    createErrorEn(ctx);
  }
};

const createErrorEn = (ctx: Context) => {
  const keyboard = new InlineKeyboard();

  keyboard.text("Back", `hafez_poems:en`);

  ctx.reply("We couldn't fetch the poem at the moment. please try again", {
    reply_markup: keyboard,
  });
};

const showPoem = async (ctx: any, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard.url("مطالعه در وبسایت گنجور", `https://ganjoor.net${link}`).row();

  keyboard.text("بازگشت", "hafez_poems:fa");

  ctx.reply(text, {
    reply_markup: keyboard,
  });
};

const showPoemEn = async (ctx: Context, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard.url("Read this at AllPoetry", `${link}`).row();

  keyboard.text("Back", "hafez_poems:en");

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

function showPageEn(
  list: any,
  ctx: Context,
  pageNum: number,
  editOrReplyToMessage: "replyMessage" | "editMessage"
) {
  let start = pageNum * itemsPerPage;
  let itemsToShow = list.slice(start, start + itemsPerPage);

  let keyboard = new InlineKeyboard();

  itemsToShow.forEach((item: any) => {
    keyboard
      .text(
        item.text,
        `p_h_en:${item.href
          .replace("https://allpoetry.com/poem/", "")
          .replace("-by-Hafez-Shirazi", "")}`
      )
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
    createPoetMenuFa(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /poet-list-from-new-message/,
    (ctx) => {
      createPoetMenuFa(ctx, "replyMessage");
    }
  );

  const createPoetMenuFa = (
    ctx: Context,
    editOrReply: "editMessage" | "replyMessage"
  ) => {
    const menu = new InlineKeyboard();

    const text =
      "به ربات تلگرام شعر های حافظ خوش آمدید. در این ربات، شما می توانید شعر های زیبای حافظ را بخوانید. همچنین با استفاده از دستور /poem می توانید شعر روز را دریافت کنید. لذت ببرید.";

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

  const createPoetMenuEn = (
    ctx: Context,
    editOrReply: "editMessage" | "replyMessage"
  ) => {
    const menu = new InlineKeyboard();

    const text =
      "Welcome to the Hafez Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poet, Hafez.  Enjoy the world of rhythm, rhyme, and profound meaning that is Hafez's poetry.";

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

  const createHafezEn = async (
    ctx: Context,
    editOrReply: "editMessage" | "replyMessage" = "replyMessage"
  ) => {
    ctx.reply("Fetching the poems. Please wait");

    try {
      listOfPoemsInEnglish = await HafezHttpClientEn.getData("", {
        author: `Hafez-Shirazi`,
      });

      if (listOfPoemsInEnglish.length === 0) {
        return createErrorEn(ctx);
      }

      showPageEn(listOfPoemsInEnglish, ctx, 0, "editMessage");
    } catch (e) {
      console.log(e);
      createErrorEn(ctx);
    }
  };

  PersianPoemsTelegramBot.addCommandEventListener("start", (ctx) =>
    createLanguageMenu(ctx)
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
    console.log("list", list);
    // @ts-ignore
    showPage(list, ctx, pageNum, "editMessage", type);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /hafez_page_en:(.+)/,
    async (ctx) => {
      const pageNum = parseInt(ctx.match[1]);
      // @ts-ignore
      const list = listOfPoemsInEnglish;
      // @ts-ignore
      showPageEn(list, ctx, pageNum, "editMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /hafez_poems_select_fa:(.+)/,
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

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_bio:fa/, async (ctx) => {
    const text =
      "خواجه شمس‌الدین محمد شیرازی متخلص به «حافظ»، غزلسرای بزرگ و از خداوندان شعر و ادب پارسی است. وی حدود سال ۷۲۶ هجری قمری در شیراز متولد شد. علوم و فنون را در محفل درس استادان زمان فراگرفت و در علوم ادبی عصر پایه‌ای رفیع یافت. خاصه در علوم فقهی و الهی تأمل بسیار کرد و قرآن را با چهارده روایت مختلف از بر داشت. گوته دانشمند بزرگ و شاعر و سخنور مشهور آلمانی دیوان شرقی خود را به نام او و با کسب الهام از افکار وی تدوین کرد. دیوان اشعار او شامل غزلیات، چند قصیده، چند مثنوی، قطعات و رباعیات است. وی به سال ۷۹۲ هجری قمری در شیراز درگذشت. آرامگاه او در حافظیهٔ شیراز زیارتگاه صاحبنظران و عاشقان شعر و ادب پارسی است.    ";
    const keyboard = new InlineKeyboard();
    keyboard
      .url(
        "سایت ویکیپدیا",
        "https://fa.wikipedia.org/wiki/%D8%AD%D8%A7%D9%81%D8%B8"
      )
      .row()
      .text("بازگشت", "back:fa")
      .row();

    return ctx.reply(text, {
      reply_markup: keyboard,
    });
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_bio:en/, async (ctx) => {
    const text = `Hafez, whose full name was Khwāja Shams-ud-Dīn Muḥammad Ḥāfeẓ-e Shīrāzī, was a prominent Persian poet of the 14th century. Born in Shiraz, Iran, around 1315, he is known for his profound and lyrical poems that masterfully blend a joyous love for life with a deep spiritual understanding. Hafez's primary poetic form was the ghazal, a short lyric poem that traditionally focuses on themes of love and loss.

    Hafez's work had a significant influence on Persian literature and culture, and he is still revered in Iran and beyond. His book of poetry, Divan-e-Hafez, is a cornerstone of Persian literature, often found in homes and regularly used for special occasions and advice. His poems are marked by their richness of allusion, complexity of language, and exploration of themes like love, spirituality, and the impermanence of life. Hafez is known for his profound wisdom, his biting satire of religious hypocrisy, and his affirmation of the liberating power of love.`;
    const keyboard = new InlineKeyboard();
    keyboard
      .url("Wikipedia", "https://en.wikipedia.org/wiki/Hafez")
      .row()
      .text("back", "select_language:en")
      .row();

    return ctx.reply(text, {
      reply_markup: keyboard,
    });
  });

  // Callbacks

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_language:en/,
    async (ctx) => {
      return createPoetMenuEn(ctx, "editMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_language:fa/,
    async (ctx) => {
      return createPoetMenuFa(ctx, "editMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_get_fal/, async (ctx) => {
    selectAndRenderRandomGhazal(ctx);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_poems:fa/, async (ctx) => {
    return createHafez(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_poems:en/, async (ctx) => {
    return createHafezEn(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/p_h_en:(.+)/, async (ctx) => {
    ctx.reply("Fetch the poem. Please wait a moment.");
    const itemLink = `${enSourceBaseURl}/poem/${ctx.match[1]}-by-Hafez-Shirazi`; // Extract link from callback data
    const poemText = await extractPoemsTextEn(ctx, itemLink);
    if (poemText) {
      showPoemEn(ctx, poemText, `http://allpoetry.com/${itemLink}`);
    }
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/back:fa/, async (ctx) => {
    return createPoetMenuFa(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/back:en/, async (ctx) => {
    return createLanguageMenu(ctx);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /hafez_main_menu_back_fa/,
    async (ctx) => {
      // console.log(ctx);
      return createLanguageMenu(ctx);
    }
  );

  PersianPoemsTelegramBot.start();
};

getHafezPoemsPersian();
