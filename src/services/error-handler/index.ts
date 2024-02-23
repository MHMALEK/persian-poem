import { Context, InlineKeyboard } from "grammy";
import * as Sentry from "@sentry/node";

const initSentryForErrorsTracking = () => {
  if (process.env.NODE_ENV != "development") {
    Sentry.init({
      dsn: "https://977d17376c5d4b56bef76b07d2e8968d@o522176.ingest.sentry.io/4505341620125696",
      tracesSampleRate: 1.0,
    });
  }
};

initSentryForErrorsTracking();

const createError = (ctx: Context) => {
  if (Sentry) {
    Sentry.captureException("error");
  }
  const keyboard = new InlineKeyboard();

  keyboard.text("Back", `hafez_poems:en`);

  ctx.reply("We couldn't fetch the poem at the moment. please try again", {
    reply_markup: keyboard,
  });
};

export default createError;
