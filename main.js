const axios = require("axios");
const cheerio = require("cheerio"); // new addition

async function scrapeSite(keyword) {
  const url = `https://www.loc.gov/item/${keyword}/`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // new addition
  const lis = [];
  const results = [];
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem).find("img").attr("src");
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    results.push({ imgSrc });
  });
  $("div.item-cataloged-data").each((i, elem) => {
    const li = $(elem).find("li").text();
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    lis.push({ li });
  });

  return { results, lis };
}

const keyword = "2014703221"; // change with any keyword you want

scrapeSite(keyword)
  .then((result) => {
    let link = `${result.results[0].imgSrc}`;
    link = link.slice(0, -10).concat("", "v.jpg");
    console.log(link);

    let data = `${result.lis[0].li}`;
    const desc = data.split("\n");
    const hope = noSpace(desc);
    console.log(hope);
  })
  .catch((err) => console.log(err));

function noSpace(array) {
  const out = [];
  for (let ele of array) {
    if (ele.replace(/\s/g, "") !== "") {
      out.push(ele);
    }
  }
  return out;
}
