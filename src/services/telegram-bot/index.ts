import { Bot, Context, session, SessionFlavor } from "grammy";
import TelegramBotMenu from "./menu/create-menu";
import { Menu } from "@grammyjs/menu";

class TelegramBot extends TelegramBotMenu {
  bot: Bot | undefined = undefined;
  constructor(private botToken: string) {
    super();
    this.create();
  }
  create() {
    this.bot = new Bot(this.botToken);
  }

  start() {
    this.bot?.start();
    this.onBotStart();
  }

  stop() {
    this.bot?.stop();
  }
  getInstance() {
    return this.bot;
  }
  sendMessage() {}

  addOnEventHandler(event: any, callBack: (ctx: Context) => void) {
    this.bot?.on(event, callBack);
  }

  addCommandEventListener(event: any, callBack: (ctx: Context) => void) {
    this.bot?.command(event, callBack);
  }

  useSession(sessionInitials?: { [x: string]: any }) {
    this.bot?.use(session<any, any>(sessionInitials));
  }

  addMenu({
    menu,
    commandName,
    menuTitle,
  }: {
    menu: Menu<Context>;
    commandName: string;
    menuTitle: string;
  }) {
    // Make it interactive.
    this.bot?.use(menu);

    const onMenuCommandCallBack = async (ctx: Context) => {
      // Send the menu.
      await ctx.reply(menuTitle, { reply_markup: menu });
    };

    this.bot?.command(commandName, onMenuCommandCallBack);
  }

  setLanguage = (ctx: Context & SessionFlavor<any>, lang: "en" | "fa") => {
    ctx.session.langauge = lang;
  };

  private onBotStart() {
    this.addCommandEventListener("start", (ctx) =>
      ctx.reply("Welcome! Up and running.")
    );
  }
}

export default TelegramBot;
