import * as cheerio from "cheerio";
import { config } from "../../poets/hafez/fa";
import HttpClient from "../../utils/http-client";
const GanjoorHttpClient = new HttpClient("https://ganjoor.net");

const loadHtml = async (url: string) => {
  return await GanjoorHttpClient.getData(url);
};

const fetchHtmlPageFromGanjoor = async (type: string) => {
  const itemLinkToFetch = `${config.sourceBaseUrl}/${type}`;
  const htmlPage = await loadHtml(itemLinkToFetch);
  return htmlPage;
};
const extractPoemsText = async (poemHtml: string) => {
  let $ = cheerio.load(poemHtml);
  let items: any = [];
  $(".b").each((index, element) => {
    let m1Text = $(element).find(".m1 p").text();
    let m2Text = $(element).find(".m2 p").text();
    items.push({ m1: m1Text, m2: m2Text });
  });
  let poem = "";
  items.forEach((item: any) => {
    poem += `${item.m1}\n ${item.m2}\n \n`;
  });

  return poem;
};

const getPoems = async (htmlPage: any) => {
  let $ = cheerio.load(htmlPage);
  let list: any = [];
  $(".poem-excerpt").each(function (i, elem) {
    list[i] = {
      text: $(this).text(),
      link: $(elem).children().attr("href"),
    };
  });

  return list;
};

export { extractPoemsText, getPoems, loadHtml, fetchHtmlPageFromGanjoor };
