import { Context, InlineKeyboard } from "grammy";
import connectToDB from "./services/db";
import PersianPoemsTelegramBot from "./services/telegram-bot";
import { addHafezEnCallbacks } from "./poets/hafez/en";
import { addHafezFaCallbacks } from "./poets/hafez/fa";
import addSelectLanguagesCallbacks from "./shared/commands";
import { addDefaultCommands } from "./commands";

const dbUrl = process.env.MANGO_DB_URL;
connectToDB(dbUrl as string);

export const createLanguageMenu = (ctx: Context) => {
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

const getHafezPoemsPersian = async () => {
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
};

// add default commands like
//start
// poem
//
addDefaultCommands();

// callbacks
addSelectLanguagesCallbacks();
addHafezFaCallbacks();
addHafezEnCallbacks();

PersianPoemsTelegramBot.start();
