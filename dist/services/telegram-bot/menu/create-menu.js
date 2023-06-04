"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu_1 = require("@grammyjs/menu");
class TelegramBotMenu {
    //   createMenu({
    //     id,
    //     menuItems,
    //     seperateRow = true,
    //     subMenus,
    //   }: {
    //     id: string;
    //     menuItems: Array<{
    //       text: string;
    //       callBack: (ctx: Context) => void;
    //       type: 'text' | 'url'
    //     }>;
    //     seperateRow: boolean;
    //     subMenus: Array<{
    //       id: string;
    //       text: string;
    //     }>;
    //   }) {
    //     const menu = new Menu(id);
    //     menuItems.forEach((menuItemData) => {
    //       const menuItem = menu.text(menuItemData.text, menuItemData.callBack);
    //       if (seperateRow) {
    //         menuItem.row();
    //       }
    //       if (subMenus?.length > 0) {
    //         subMenus.forEach((subMenu) => {
    //           menuItem.submenu(subMenu.text, subMenu.id);
    //         });
    //       }
    //     });
    //     return menu;
    //   }
    createMenu(id) {
        return new menu_1.Menu(id);
    }
}
exports.default = TelegramBotMenu;
