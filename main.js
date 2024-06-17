const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeSite(keyword) {
  const url = `https://www.loc.gov/item/${keyword}/`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const results = [];
  
  // Extract image sources
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem).find("img").attr("src");
    results.push({ imgSrc });
  });

  // Extract item titles and their corresponding list items
  $("div.item-cataloged-data").each((i, elem) => {
    const liText = $(elem).find("ul").find("li").first().text().trim();
      results.push({ title: liText });
  });



  return results;
}

const keyword = "2014703222"; // change with any keyword you want

scrapeSite(keyword)
  .then((results) => {
    results.forEach((result) => {
      if (result.imgSrc) {
        let link = result.imgSrc.slice(0, -10).concat("", "v.jpg");
       console.log(link);
      } else {
        console.log(`Title: ${result.title}`);
      }
    });
  })
  .catch((err) => console.log(err));

// function noSpace(array) {
//   return array.filter((ele) => ele.replace(/\s/g, "") !== "");
// }
