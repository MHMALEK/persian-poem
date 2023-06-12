import { Context, InlineKeyboard } from "grammy";
import {
  extractPoemsText,
  getPoems,
} from "../../../services/allpoetry-crawler";
import { saveAnalyticsEvent } from "../../../services/analytics";
import createError from "../../../services/error-handler";
import PersianPoemsTelegramBot from "../../../services/telegram-bot";
import { createLanguageMenu } from "../../../shared/commands";

const config = {
  pagination: {
    itemPerPage: 10,
  },
};

const enSourceBaseURl = "https://allpoetry.com";
let listOfPoemsInEnglish: any = [];

const showPoemEn = async (ctx: Context, text: string, link: string) => {
  // show menu at the end of poem
  let keyboard = new InlineKeyboard();
  keyboard.url("Read this at AllPoetry", `${link}`).row();

  keyboard.text("Back", "hafez_poems:en");

  ctx.reply(text, {
    reply_markup: keyboard,
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

  if (start + config.pagination.itemPerPage < list.length) {
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

const createHafezMenuEn = (
  ctx: Context,
  editOrReply: "editMessage" | "replyMessage"
) => {
  const menu = new InlineKeyboard();

  const text =
    "Welcome to the Persian Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poetry.  Enjoy the world of rhythm, rhyme, and profound meaning that is Persian's poetry.";

  menu.text("Poems", "hafez_poems:en").row();
  menu.text("About Hafez Shirazi", "hafez_bio:en").row();
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

const createHafezEn = async (
  ctx: Context,
  editOrReply: "editMessage" | "replyMessage" = "replyMessage"
) => {
  ctx.reply("Fetching the poems list. Please wait few seconds...");

  try {
    listOfPoemsInEnglish = await getPoems();
    showPageEn(listOfPoemsInEnglish, ctx, 0, "replyMessage");
  } catch (e) {
    // Sentry.captureException(e);
    createError(ctx);
  }
};

const addHafezEnCallbacks = () => {
  // Callbacks
  PersianPoemsTelegramBot.bot?.callbackQuery(
    /hafez_page_en:(.+)/,
    async (ctx) => {
      const pageNum = parseInt(ctx.match[1]);
      saveAnalyticsEvent(ctx, `hafez_page_en:${pageNum}`);
      // @ts-ignore
      const list = listOfPoemsInEnglish;
      // @ts-ignore
      showPageEn(list, ctx, pageNum, "editMessage");
    }
  );

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

  PersianPoemsTelegramBot.bot?.callbackQuery(/hafez_poems:en/, async (ctx) => {
    return createHafezEn(ctx, "editMessage");
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/p_h_en:(.+)/, async (ctx) => {
    ctx.reply("Fetching the poem text. Please wait few seconds...");
    const itemLink = `${enSourceBaseURl}/poem/${ctx.match[1]}-by-Hafez-Shirazi`; // Extract link from callback data
    const poemText = await extractPoemsText(itemLink);
    if (poemText) {
      showPoemEn(ctx, poemText, `http://allpoetry.com/${itemLink}`);
    }
  });

  PersianPoemsTelegramBot.bot?.callbackQuery(/back:en/, async (ctx) => {
    return createLanguageMenu(ctx);
  });
};

export {
  showPoemEn,
  showPageEn,
  createHafezMenuEn,
  createHafezEn,
  addHafezEnCallbacks,
};
