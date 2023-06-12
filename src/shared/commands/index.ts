import { createPoetMenuEn } from "../../poets/hafez/en";
import { createPoetMenuFa } from "../../poets/hafez/fa";
import PersianPoemsTelegramBot from "../../services/telegram-bot";

const addSelectLanguagesCallback = () => {
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
};

export default addSelectLanguagesCallback;
