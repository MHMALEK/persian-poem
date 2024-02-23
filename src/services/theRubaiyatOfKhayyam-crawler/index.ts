import * as cheerio from "cheerio";
import HttpClient from "../../utils/http-client";
const robaiyatKhayyaBaseUrl =
  "https://www.therubaiyatofomarkhayyam.com/rubaiyat-full-text/";

const RobaiyatKhayyamHttpClient = new HttpClient(robaiyatKhayyaBaseUrl);
let poemList: any = [];
const loadHtml = async () => {
  return await RobaiyatKhayyamHttpClient.getData("");
};

const fetchHtmlPageFromRobaiyatKhayyam = async () => {
  const htmlPage = await loadHtml();
  return htmlPage;
};
const extractPoemsText = async (id: string) => {
  const poem = poemList.filter((poem: any) => {
    console.log("asdasdasdsadasdasdas", poem, id);
    return String(poem.id) === String(id);
  });
  console.log(poem);
  return poem;
};

const getPoems = async () => {
  const htmlPage = await loadHtml();

  let $ = cheerio.load(htmlPage);

  $(".full-text p").each(function (i, elem) {
    let title = `Rubaiyat - ${$(this).text().trim()}`;
    let poem = $(this).next("pre").text();
    poemList.push({
      id: i,
      text: title,
      poem,
    });
  });
  return poemList;
};

export {
  extractPoemsText,
  getPoems,
  loadHtml,
  fetchHtmlPageFromRobaiyatKhayyam,
};
