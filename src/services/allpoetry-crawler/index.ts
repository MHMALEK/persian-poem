import HttpClient from "../../utils/http-client";

const AllpoetryHttpClient = new HttpClient(
  "https://dlwt55w2cx2wh7b2tbrfot54lm0zupfu.lambda-url.eu-north-1.on.aws/"
);

const extractPoemsText = async (poemUrl: string) => {
  try {
    const poem = await AllpoetryHttpClient.getData("", {
      poem_url: poemUrl,
    });

    return poem;
  } catch (e: any) {
    throw new Error(e);
  }
};

const getPoems = async () => {
  const listOfPoemsInEnglish = await AllpoetryHttpClient.getData("", {
    author: `Hafez-Shirazi`,
  });
  return listOfPoemsInEnglish;
};

export { extractPoemsText, getPoems };
