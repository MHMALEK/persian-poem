"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const create_menu_1 = __importDefault(require("./menu/create-menu"));
class TelegramBot extends create_menu_1.default {
    constructor(botToken) {
        super();
        this.botToken = botToken;
        this.bot = undefined;
        this.create();
    }
    create() {
        this.bot = new grammy_1.Bot(this.botToken);
    }
    start() {
        var _a;
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.start();
        this.onBotStart();
    }
    stop() {
        var _a;
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.stop();
    }
    getInstance() {
        return this.bot;
    }
    sendMessage() { }
    addOnEventHandler(event, callBack) {
        var _a;
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.on(event, callBack);
    }
    addCommandEventListener(event, callBack) {
        var _a;
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.command(event, callBack);
    }
    addMenu({ menu, commandName, menuTitle, }) {
        var _a, _b;
        // Make it interactive.
        (_a = this.bot) === null || _a === void 0 ? void 0 : _a.use(menu);
        const onMenuCommandCallBack = (ctx) => __awaiter(this, void 0, void 0, function* () {
            // Send the menu.
            yield ctx.reply(menuTitle, { reply_markup: menu });
        });
        (_b = this.bot) === null || _b === void 0 ? void 0 : _b.command(commandName, onMenuCommandCallBack);
    }
    onBotStart() {
        this.addCommandEventListener("start", (ctx) => ctx.reply("Welcome! Up and running."));
    }
}
exports.default = TelegramBot;
