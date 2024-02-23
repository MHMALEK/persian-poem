import { Context, InlineKeyboard } from "grammy";

import { saveAnalyticsEvent } from "../../../services/analytics";
import createError from "../../../services/error-handler";
import PersianPoemsTelegramBot from "../../../services/telegram-bot";
import {
  extractPoemsText,
  getPoems,
} from "../../../services/theRubaiyatOfKhayyam-crawler";
import { createLanguageMenu } from "../../../shared/commands";

const config = {
  pagination: {
    itemPerPage: 10,
  },
};

const enSourceBaseURl =
  "https://www.therubaiyatofomarkhayyam.com/rubaiyat-full-text/";
let listOfPoemsInEnglish: any = [];

const showPoemEn = async (ctx: Context, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard
    .url(
      "Read this at The Rubaiyat of khayyam website",
      `https://www.therubaiyatofomarkhayyam.com/`
    )
    .row();

  keyboard.text("Back", "khayam_poems:en");

  ctx.reply(text, {
    reply_markup: keyboard,
    parse_mode: "HTML",
  });
};

function showPageEn(
  list: any,
  ctx: Context,
  pageNum: number,
  editOrReplyToMessage: "replyMessage" | "editMessage"
) {
  let start = pageNum * config.pagination.itemPerPage;
  let itemsToShow = list.slice(start, start + config.pagination.itemPerPage);

  let keyboard = new InlineKeyboard();

  itemsToShow.forEach((item: any) => {
    keyboard.text(item.text, `khayam_select_poem_en:${item.id}`).row();
  });

  if (pageNum > 0) {
    keyboard.text("⬅️ Previous", `khayam_page_en:${pageNum - 1}`);
  }

  if (start + config.pagination.itemPerPage < list.length) {
    keyboard.text("Next ➡️", `khayam_page_en:${pageNum + 1}`);
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

const createKhayamMenuEn = (
  ctx: Context,
  editOrReply: "editMessage" | "replyMessage"
) => {
  const menu = new InlineKeyboard();

  const text =
    "Welcome to the Khayam Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poet, Khayam.  Enjoy the world of rhythm, rhyme, and profound meaning that is Khayam's poetry.";

  menu.text("Poems", "khayam_poems:en").row();
  menu.text("About Khayam", "khayam_bio:en").row();
  menu.text("back", "back_to_poet_menu_en").row();

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

const createKhayamEn = async (ctx: Context) => {
  ctx.reply("Fetching the poems list. Please wait few seconds...");

  try {
    listOfPoemsInEnglish = await getPoems();
    showPageEn(listOfPoemsInEnglish, ctx, 0, "replyMessage");
  } catch (e) {
    // Sentry.captureException(e);
    createError(ctx);
  }
};

const addKhayamEnCallbacks = () => {
  // Callbacks
  PersianPoemsTelegramBot.bot?.callbackQuery(
    /khayam_page_en:(.+)/,
    async (ctx) => {
      const pageNum = parseInt(ctx.match[1]);
      saveAnalyticsEvent(ctx, `khayam_page_en:${pageNum}`);
      // @ts-ignore
      const list = listOfPoemsInEnglish;
      // @ts-ignore
      showPageEn(list, ctx, pageNum, "editMessage");
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/khayam_bio:en/, async (ctx) => {
    const text = `Khayam, whose full name was Khwāja Shams-ud-Dīn Muḥammad Ḥāfeẓ-e Shīrāzī, was a prominent Persian poet of the 14th century. Born in Shiraz, Iran, around 1315, he is known for his profound and lyrical poems that masterfully blend a joyous love for life with a deep spiritual understanding. Khayam's primary poetic form was the ghazal, a short lyric poem that traditionally focuses on themes of love and loss.

    Khayam's work had a significant influence on Persian literature and culture, and he is still revered in Iran and beyond. His book of poetry, Divan-e-Khayam, is a cornerstone of Persian literature, often found in homes and regularly used for special occasions and advice. His poems are marked by their richness of allusion, complexity of language, and exploration of themes like love, spirituality, and the impermanence of life. Khayam is known for his profound wisdom, his biting satire of religious hypocrisy, and his affirmation of the liberating power of love.`;
    const keyboard = new InlineKeyboard();
    keyboard
      .url("Wikipedia", "https://en.wikipedia.org/wiki/Khayam")
      .row()
      .text("back", "select_language:en")
      .row();

    return ctx.reply(text, {
      reply_markup: keyboard,
    });
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/khayam_poems:en/, async (ctx) => {
    return createKhayamEn(ctx);
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /khayam_select_poem_en:(.+)/,
    async (ctx) => {
      const itemId = ctx.match[1]; // Extract link from callback data
      console.log(ctx.match, itemId);
      const poemText = await extractPoemsText(itemId);
      console.log("poemText", poemText);
      if (poemText && poemText.length > 0) {
        const text = poemText[0]?.poem;
        showPoemEn(ctx, text, enSourceBaseURl);
      }
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/back:en/, async (ctx) => {
    return createLanguageMenu(ctx);
  });
};

export {
  showPoemEn,
  showPageEn,
  createKhayamMenuEn,
  createKhayamEn,
  addKhayamEnCallbacks,
};
