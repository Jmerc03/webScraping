const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs"),
  request = require("request");

function pop(arr, headers) {
  let i = 0;
  const image = {};
  const notesArr = [];
  const metaArr = [];
  for (let head of headers) {
    // console.log(arr[i], i, head);
    if (arr[i].indexOf("-") === 0) {
      while (arr[i].indexOf("-") === 0) {
        notesArr.push(arr[i]);
        i++;
      }
      image[head] = notesArr;
    } else if (head === "additional") {
      while (i < arr.length) {
        metaArr.push(arr[i]);
        i++;
      }
      image[head] = metaArr;
      image.done = true;
      break;
    } else {
      image[head] = arr[i];
      i++;
    }
  }
  return image;
}

async function scrapeSite(keyword, i) {
  const url = `https://www.loc.gov/item/${keyword}/`;
  //   console.log(url);
  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // new addition
  const uls = [];
  const h3s = [];
  const results = [];
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem).find("img").attr("src");
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    results.push({ imgSrc });
  });
  $("div.item-cataloged-data").each((i, elem) => {
    const ul = $(elem).find("ul").text();
    const h3 = $(elem).find("h3").text();
    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    h3s.push({ h3 });
    uls.push({ ul });
  });

  return { results, uls, h3s, i };
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

function isDone(images) {
  for (let ele of images) {
    if (!ele.done) return false;
  }
  return true;
}

async function updateImages(keywords) {
  for (let key of keywords) {
    scrapeSite(key)
      .then((result) => {
        let link = `${result.results[0].imgSrc}`
          .slice(0, -10)
          .concat("", "v.jpg");

        let headers = `${result.h3s[0].h3}`.split("\n");
        // console.log(headers, " DSFSDF SD");
        for (let i = 0; i < headers.length; i++) {
          headers[i] = `${headers[i].trim().split(" ")[0]}`;
        }
        let headersBig = [];
        for (let title of headers) {
          if (title != "") {
            headersBig.push(title);
          }
        }
        headersBig.unshift("Link");
        // console.log(headersBig);

        let data = noSpace(`${result.uls[0].ul}`.split("\n"));
        data.unshift(link);

        // console.log(1, i);
        // console.log(data);
        const thing = pop(data, headersBig);
        // console.log(thing, "what");
        images.push(thing);
      })
      .then(() => {
        finished++;
      })
      .finally(() => {
        if (finished === keywords.length) {
          console.log(images, "IT WORKSSS ???");
          codeMoney = true;
          for (let photo of images) {
            console.log(photo);
            console.log(photo.Link);
            download(
              photo.Link,
              `/Users/softwaredev/Dev/webScraping/photos/${photo.Library}.jpg`,
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

const images = [];

let finished = 0;

const keywords = [];
for (let i = 0; i < 20; i++) {
  console.log((i + 2014703221).toString());
  keywords.push((i + 2014703221).toString());
}

const p = new Promise(() => updateImages(keywords));
p.finally();

console.log("what");
