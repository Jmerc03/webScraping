const axios = require("axios");
const cheerio = require("cheerio"); // new addition

async function scrapeSite(keyword) {
  const url = `https://www.loc.gov/item/${keyword}/`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // new addition
  const imgs = [];
  const results = [];
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem).find("img").attr("src");
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    results.push({ imgSrc });
  });

  return results;
}

const keyword = "2014703221"; // change with any keyword you want

scrapeSite(keyword)
  .then((result) => {
    let thing = `${result[0].imgSrc}`;
    thing = thing.slice(0, -10).concat("", "v.jpg");
    console.log(thing);
  })
  .catch((err) => console.log(err));
