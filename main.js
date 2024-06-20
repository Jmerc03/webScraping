const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs"),
  request = require("request");

async function scrapeSite(keyword, i) {
  const url = `https://www.loc.gov/item/${keyword}/`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data); // new addition

  const imageData = {};
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem)
      .find("img")
      .attr("data-image-tablet")
      .slice(0, $(elem).find("img").attr("data-image-tablet").indexOf(".jpg"))
      .concat(".jpg");
    imageData["link"] = imgSrc;
  });
  $("div.item-cataloged-data").each(
    (i, elem1) => {
      $(elem1)
        .find("h3")
        .each((j, elem2) => {
          let key = `${$(elem2).attr("id").slice(5)}`;
          let valueArray =
            noSpace(
              $(elem1)
                .find(`ul[aria-labelledby*=${$(elem2).attr("id")}]`)
                .text()
                .trim()
                .split("\n")
            ).length >= 2;
          let value = valueArray
            ? noSpace(
                $(elem1)
                  .find(`ul[aria-labelledby*=${$(elem2).attr("id")}]`)
                  .text()
                  .trim()
                  .split("\n")
              )
            : $(elem1)
                .find(`ul[aria-labelledby*=${$(elem2).attr("id")}]`)
                .text()
                .trim();
          value = value.indexOf("-") === 0 ? value.slice(1).trim() : value;
          //   console.log(key, typeof key);
          imageData[key] = value;
        });
      //   console.log("imageData:", imageData);
    }
    // console.log(ul);
  );

  return imageData;
}

function download(uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    // console.log("Erorr????");
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
}

function noSpace(array) {
  const out = [];
  let isLine = false;
  for (let ele of array) {
    if (ele.replace(/\s/g, "") !== "" && ele.replace(/\s/g, "") !== "-") {
      if (ele.chatAt == "-") {
        ele = ele.slice(1).trim().replace("\n", "");
      }
      out.push(ele.trim());
    }
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
        // console.log(result);
        images.push(result);
      })
      .then(() => {
        finished++;
      })
      .finally(() => {
        if (finished === keywords.length) {
          //   console.log(images, "IT WORKSSS ???");
          codeMoney = true;
          for (let photo of images) {
            const titleWords = photo.title.split(" ");
            let photoTitle;
            if (titleWords.length > 1) {
              photoTitle = titleWords[0].concat("-", titleWords[1]);
            } else {
              photoTitle = titleWords[0];
            }
            // console.log(photoTitle);

            download(
              photo.link,
              `/Users/softwaredev/Dev/webScraping/photos/${
                photo.library_of_congress_control_number === undefined
                  ? photoTitle
                  : photo.library_of_congress_control_number
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

const keywords = ["afc1982009_te_027a", "2014703222"];
for (let i = 0; i < 20; i++) {
  keywords.push((i + 2014703221).toString());
}

const p = new Promise(() => updateImages(keywords));
p.finally();
