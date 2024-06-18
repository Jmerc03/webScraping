const axios = require("axios");
const cheerio = require("cheerio"); // new addition
const fs = require("fs"),
  request = require("request");

async function scrapeSite(keyword, i) {
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

  return { results, lis, i };
}
function download(uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
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
  this.done = false;
  this.pop = function (arr) {
    let i = 0;
    const notesArr = [];
    const metaArr = [];
    for (let key in this) {
      if (arr[i].indexOf("-") === 0) {
        while (arr[i].indexOf("-") === 0) {
          notesArr.push(arr[i]);
          i++;
        }
        this[key] = notesArr;
      } else if (key === "metaDataFormats") {
        while (i < arr.length) {
          metaArr.push(arr[i]);
          i++;
        }
        this[key] = metaArr;
        this.done = true;
        break;
      } else {
        this[key] = arr[i];
        i++;
      }
    }
  };
}

const keywords = [];
for (let i = 0; i < 10; i++) {
  console.log((i + 2014703221).toString());
  keywords.push((i + 2014703221).toString());
}

const images = [];
let hope;
let codeMoney = false;

for (let key of keywords) {
  images.push(new Image(key));
}
async function updateImages(images) {
  for (let i = 0; i < images.length; i++) {
    scrapeSite(images[i].lccn, i)
      .then((result) => {
        let link = `${result.results[0].imgSrc}`;
        link = link.slice(0, -10).concat("", "v.jpg");

        let data = `${result.lis[0].li}`;
        let desc = data.split("\n");
        hope = noSpace(desc);

        hope.unshift(link);
        console.log(1, i);
        images[i].pop(hope);
      })
      .finally(() => {
        if (isDone(images)) {
          console.log(images, "IT WORKSSS ???");
          codeMoney = true;
          for (let photo of images) {
            console.log(photo.link);
            download(
              photo.link,
              `/Users/softwaredev/Dev/webScraping/photos/${photo.lccn}.jpg`,
              function () {
                console.log("done");
              }
            );
          }
        }
        // console.log(images);
      });
    // console.log(3, "what", i);
  }
  //   console.log(4, "done");
}
const p = new Promise(() => updateImages(images));

p.finally();

console.log("what");

function isDone(images) {
  for (let ele of images) {
    if (!ele.done) return false;
  }
  return true;
}
