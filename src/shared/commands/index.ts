import { Context, InlineKeyboard } from "grammy";
import { createHafezMenuEn } from "../../poets/hafez/en";
import { createHafezMenuFa } from "../../poets/hafez/fa";
import { createKhayamMenuEn } from "../../poets/khayyam/en";
import { createKhayamMenuFa } from "../../poets/khayyam/fa";
import { createMoulaviEn, createMoulaviMenuEn } from "../../poets/molana/en";
import { createMoulaviMenuFa } from "../../poets/molana/fa";
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
    "Welcome to the Persian Poetry Bot! I'm here to share with you the beautiful verses of the great Persian poetry.  Enjoy the world of rhythm, rhyme, and profound meaning that is Persian's poetry.";

  const textFa =
    "به ربات تلگرام شعر فارسی خوش آمدید. در این ربات، شما می توانید شعرهای زیبای فارسی را به دو زبان انگلیسی و فارسی بخوانید و لذت ببرید.";

  const finalText = `
    
${textFa}

${textEn}

<b>What language do you want to read the poems?</b>
    `;

  keyboard.text("English", "select_language:en");
  keyboard.text("فارسی", "select_language:fa");

  ctx.reply(finalText, {
    reply_markup: keyboard,
    parse_mode: "HTML",
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
      fa: "حافظ شیرازی",
    },
    id: "hafez",
  },
  khayyam: {
    title: {
      en: "khayyam",
      fa: "خیام",
    },
    id: "khayyam",
  },
  moulavi: {
    title: {
      en: "moulavi",
      fa: "مولانا",
    },
    id: "moulavi",
  },
  // saadi: {
  //   title: {
  //     en: "Saadi",
  //     fa: "سعدی",
  //   },
  //   id: "khayyam",
  // },
};

const createPoetListFa = async (ctx: Context) => {
  const keyboard = new InlineKeyboard();
  Object.values(poets).forEach((poet) => {
    keyboard.text(poet.title.fa, `select_poet_fa:${poet.id}`).row();
  });
  keyboard.text("بازگشت", "go_back_to_language_menu:fa").row();

  ctx.editMessageText("لطفا شاعر مورد نظر خود را انتخاب نمایید.", {
    reply_markup: keyboard,
  });
};

const createPoetListEn = async (ctx: Context) => {
  const keyboard = new InlineKeyboard();
  Object.values(poets).forEach((poet) => {
    keyboard.text(poet.title.en, `select_poet_en:${poet.id}`).row();
  });
  keyboard.text("Back", "go_back_to_language_menu:en").row();
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
        case "moulavi":
          return createMoulaviMenuFa(ctx, "editMessage");
        default:
          return createKhayamMenuFa(ctx, "editMessage");
      }
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /select_poet_en:(.+)/,
    async (ctx) => {
      const poetId = ctx.match[1];
      switch (poetId) {
        case "hafez":
          return createHafezMenuEn(ctx, "editMessage");
        case "khayyam":
          return createKhayamMenuEn(ctx, "editMessage");
        case "moulavi":
          // return createMoulaviMenuEn(ctx, "editMessage");
          return ctx.reply("We're working on it... Soon...");
        default:
          return createKhayamMenuEn(ctx, "editMessage");
      }
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /go_back_to_language_menu:(.+)/,
    async (ctx) => {
      createLanguageMenu(ctx);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /back_to_poet_menu_en/,
    async (ctx) => {
      createPoetListEn(ctx);
    }
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(
    /back_to_poet_menu_fa/,
    async (ctx) => {
      createPoetListFa(ctx);
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
