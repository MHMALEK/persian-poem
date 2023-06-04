import HttpClient from "../../utils/http-client";
import * as cheerio from "cheerio";
import { PersianPoemsTelegramBot } from "../..";
import { Menu, MenuRange } from "@grammyjs/menu";
import { Context, InlineKeyboard } from "grammy";

const HafezHttpClient = new HttpClient("https://ganjoor.net/hafez/");

const getHafezPoemsAPI = async () => {
  const ghazalsList = await HafezHttpClient.getData("/ghazal");
  let $ = cheerio.load(ghazalsList);
  // Select the list items and map over them
  let items: any = [];
  $(".poem-excerpt").each(function (i, elem) {
    items[i] = { text: $(this).text(), link: $(elem).children().attr("href") };
  });

  const itemsPerPage = 10;

  //   PersianPoemsTelegramBot.bot?.command("start", (ctx) => showPage(ctx, 0));

  PersianPoemsTelegramBot.bot?.callbackQuery(/ghazal:(.+)/, async (ctx) => {
    console.log("asdasd", ctx.match[1]);
    let itemLink = ctx.match[1]; // Extract link from callback data
    // await ctx.answerCallbackQuery();

    const ghazalItem = await HafezHttpClient.getData(
      ctx.match[1].split("/hafez/")[1]
    );

    let $ = cheerio.load(ghazalItem);
    let items: any = [];
    $(".b").each((index, element) => {
      let m1Text = $(element).find(".m1 p").text();
      let m2Text = $(element).find(".m2 p").text();
      items.push({ m1: m1Text, m2: m2Text });
    });
    let replyMessage = "";
    items.forEach((item: any, index: number) => {
      replyMessage += `${item.m1}\n \n`;
    });
    replyMessage += `https://ganjoor.net${itemLink}`;

    ctx.reply(replyMessage);
  });

  function showPage(
    ctx: Context,
    pageNum: number,
    editOrReplyToMessage: "replyMessage" | "editMessage"
  ) {
    let start = pageNum * itemsPerPage;
    let itemsToShow = items.slice(start, start + itemsPerPage);

    let keyboard = new InlineKeyboard();

    itemsToShow.forEach((item: any, index: number) => {
      keyboard.text(item.text, `ghazal:${item.link}`).row();
    });

    keyboard.row();
    if (pageNum > 0) {
      keyboard.text("⬅️ Previous", `page:${pageNum - 1}`);
    }

    if (start + itemsPerPage < items.length) {
      keyboard.text("Next ➡️", `page:${pageNum + 1}`);
    }

    if (editOrReplyToMessage === "replyMessage") {
      ctx.reply(`صفحه ${pageNum + 1}`, { reply_markup: keyboard });
    }
    if (editOrReplyToMessage === "editMessage") {
      ctx.editMessageText(`صفحه ${pageNum + 1}`, { reply_markup: keyboard });
    }
  }

  PersianPoemsTelegramBot.addCommandEventListener("hafez_ghazal", (ctx) =>
    showPage(ctx, 0, "replyMessage")
  );

  PersianPoemsTelegramBot.bot?.callbackQuery(/page:(\d+)/, (ctx) => {
    let pageNum = parseInt(ctx.match[1]);
    return showPage(ctx, pageNum, "editMessage");
  });

  PersianPoemsTelegramBot.start();
};

export { getHafezPoemsAPI };
