import { Context, InlineKeyboard } from "grammy";
import { createHafezMenuEn } from "../../poets/hafez/en";
import { createHafezMenuFa } from "../../poets/hafez/fa";
import { createKhayamMenuFa } from "../../poets/khayyam/fa";
import PersianPoemsTelegramBot from "../../services/telegram-bot";

const addSelectLanguagesCallback = () => {
  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_language:en/,
    async (ctx) => {
      return createPoetListEn(ctx);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_language:fa/,
    async (ctx) => {
      return createPoetListFa(ctx);
    }
  );
};

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
    id: "hafez",
  },
  khayyam: {
    title: {
      en: "Khayyam",
      fa: "خیام",
    },
    id: "saadi",
  },
  saadi: {
    title: {
      en: "Saadi",
      fa: "سعدی",
    },
    id: "khayyam",
  },
};

const createPoetListFa = async (ctx: Context) => {
  const keyboard = new InlineKeyboard();
  Object.values(poets).forEach((poet) => {
    keyboard.text(poet.title.fa, `select_poet_fa:${poet.id}`).row();
  });
  ctx.editMessageText("لطفا شاعر مورد نظر خود را انتخاب نمایید.", {
    reply_markup: keyboard,
  });
};

const createPoetListEn = async (ctx: Context) => {
  const keyboard = new InlineKeyboard();
  console.log();
  keyboard.text(poets.hafez.title.en, `select_poet_en:${poets.hafez.id}`).row();
  ctx.editMessageText("Plase select a poet", {
    reply_markup: keyboard,
  });
};

const addSelectPoetCallbacks = () => {
  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_poet_fa:(.+)/,
    async (ctx) => {
      console.log(ctx.match);
      const poetId = ctx.match[1];

      switch (poetId) {
        case "hafez":
          return createHafezMenuFa(ctx, "editMessage");
        case "saadi":
          return createKhayamMenuFa(ctx, "editMessage");
        case "khayyam":
          return createKhayamMenuFa(ctx, "editMessage");
        default:
          return createKhayamMenuFa(ctx, "editMessage");
      }
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_poet_en:(.+)/,
    async (ctx) => {
      const poetId = ctx.match[1];

      return createHafezMenuEn(ctx, "editMessage");
    }
  );
};

export {
  addSelectLanguagesCallback,
  createLanguageMenu,
  addSelectPoetCallbacks,
  createPoetListFa,
  createPoetListEn,
};
