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
    const li = $(elem).find("ul").text();
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    lis.push({ li });
  });

  return { results, lis };
}

function noSpace(array) {
  const out = [];
  let isLine = false;
  for (let ele of array) {
    if (ele.replace(/\s/g, "") !== "" && ele.replace(/\s/g, "") !== "-")
      if (isLine) {
        out.push("- ".concat("", ele.trim()));
        isLine = false;
      } else {
        out.push(ele.trim());
      }

    if (ele.trim() === "-") isLine = true;
    else false;
  }
  return out;
}

//object constructor function
function Image(LCCN) {
  this.link = "";
  this.title = "";
  this.summary = "";
  this.contrNames = "";
  this.created = "";
  this.heading = "";
  this.genre = "";
  this.notes = [];
  this.medium = "";
  this.callNum = "";
  this.sourceColl = "";
  this.repo = "";
  this.digId = "";
  this.lccn = LCCN;
  this.reproductionNum = "";
  this.rights = "";
  this.format = "";
  this.permalink = "";
  this.metaDataFormats = [];
  this.pop = function (arr) {
    let i = 0;
    const notesArr = [];
    const metaArr = [];
    for (let key in this) {
      console.log(key, arr[i]);
      if (arr[i].indexOf("-") === 0) {
        while (arr[i].indexOf("-") === 0) {
          notesArr.push(arr[i]);
          i++;
        }
        // console.log("\n", notesArr, "\n");
        this[key] = notesArr;
      } else if (key === "metaDataFormats") {
        while (i < arr.length) {
          metaArr.push(arr[i]);
          i++;
        }
        this[key] = metaArr;
        break;
      } else {
        this[key] = arr[i];
        i++;
      }
    }
  };
}

//array of object creation

const keyword = "2014703221"; // change with any keyword you want

const num1 = new Image(keyword);
console.log(num1);

scrapeSite(keyword)
  .then((result) => {
    let link = `${result.results[0].imgSrc}`;
    link = link.slice(0, -10).concat("", "v.jpg");
    // console.log(link);

    let data = `${result.lis[0].li}`;
    // console.log(data);
    const desc = data.split("\n");
    // console.log(desc);
    const hope = noSpace(desc);
    // console.log(hope);

    hope.unshift(link);
    num1.pop(hope);
    console.log(num1);
  })
  .catch((err) => console.log(err));
