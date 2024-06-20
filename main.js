const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs"),
  request = require("request");

function pop(arr, headers) {
  let i = 0;
  const image = {};
  const metaArr = [];
  for (let head of headers) {
    if (arr[i].indexOf("-") === 0) {
      const notesArr = [];
      while (arr[i].indexOf("-") === 0) {
        notesArr.push(arr[i]);
        i++;
      }

      image[head] = notesArr;
    } else if (head === headers[-1]) {
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

  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // new addition
  const uls = [];
  const h3s = [];
  const results = [];
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem).find("img").attr("data-image-tablet");

    // const text = $(elem).find("span:first-child").text();
    // results.push({ imgSrc, text });
    results.push({ imgSrc });
  });
  $("div.item-cataloged-data").each((i, elem) => {
    const ul = $(elem).find("ul").text();
    const h3 = $(elem).find("h3").text();
    h3s.push({ h3 });
    uls.push({ ul });
  });

  return { results, uls, h3s, i };
}

function download(uri, filename, callback) {
  request.head(uri, function (err, res, body) {
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
          .slice(0, result.results[0].imgSrc.indexOf(".jpg"))
          .concat("", ".jpg");

        let headers = `${result.h3s[0].h3}`.split("\n");
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

        let data = noSpace(`${result.uls[0].ul}`.split("\n"));
        data.unshift(link);
        const thing = pop(data, headersBig);
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
            const titleWords = photo.Title.split(" ");
            let photoTitle;
            if (titleWords.length > 1) {
              photoTitle = titleWords[0].concat("-", titleWords[1]);
            } else {
              photoTitle = titleWords[0];
            }

            download(
              photo.Link,
              `/Users/softwaredev/Dev/webScraping/photos/${
                photo.Library === undefined ? photoTitle : photo.Library
              }.jpg`,
              function () {}
            );
          }
        }

        let myJson = JSON.stringify(images);

        fs.writeFile("info.json", myJson, function (err) {
          if (err) {
            console.log(err);
          }
        });
      });
  }
}

const images = [];

let finished = 0;

const keywords = ["afc1982009_te_027a"];
for (let i = 0; i < 20; i++) {
  keywords.push((i + 2014703221).toString());
}

const p = new Promise(() => updateImages(keywords));
p.finally();
