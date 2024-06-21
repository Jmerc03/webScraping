const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs"),
  request = require("request");

//given a keyword (ex: a lccn) scrapes loc website and returns an object containing the link of the images and the header ids as keys and ils belonging to those keys
async function scrapeSite(keyword) {
  const url = `https://www.loc.gov/item/${keyword}/`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const imageData = {};

  //grab image link
  $("div.preview").each((i, elem) => {
    const imgSrc = $(elem)
      .find("img")
      .attr("data-image-tablet")
      .slice(0, $(elem).find("img").attr("data-image-tablet").indexOf(".jpg"))
      .concat(".jpg");
    imageData["link"] = imgSrc;
  });

  //grab image data
  $("div.item-cataloged-data").each((i, elem1) => {
    $(elem1)
      .find("h3")
      .each((j, elem2) => {
        let id = `${$(elem2).attr("id")}`;
        let text = $(elem1).find(`ul[aria-labelledby*=${id}]`).text().trim();
        let key = id.slice(5);
        let valueArray = noSpace(text.split("\n")).length >= 2;
        let value = valueArray ? noSpace(text.split("\n")) : text;
        value = value.indexOf("-") === 0 ? value.slice(1).trim() : value;
        imageData[key] = value;
      });
  });
  return imageData;
}

function download(uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
}

//eleminates whitespace and empty array elems
function noSpace(array) {
  const out = [];
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

// main body loop
async function updateImages(keywords) {
  for (let key of keywords) {
    scrapeSite(key)
      .then((result) => {
        images.push(result);
      })
      .then(() => {
        finished++;
      })
      .finally(() => {
        if (finished === keywords.length) {
          for (let photo of images) {
            const titleWords = photo.title.split(" ");
            let photoTitle;
            if (titleWords.length > 1) {
              photoTitle = titleWords[0].concat("-", titleWords[1]);
            } else {
              photoTitle = titleWords[0];
            }

            if (!fs.existsSync("./photos")) {
              fs.mkdir("photos", (err) => {
                if (err) {
                  return console.error(err);
                }
                console.log("Directory created successfully!");
              });
            }

            download(
              photo.link,
              `./photos/${
                photo.library_of_congress_control_number === undefined
                  ? photoTitle
                  : photo.library_of_congress_control_number
              }.jpg`,
              function () {}
            );
          }

          let myJson = JSON.stringify(images);

          fs.writeFile("info.json", myJson, function (err) {
            if (err) {
              console.log(err, "why");
            }
          });
        }
      });
  }
}

const images = [];

let finished = 0;

const keywords = [];

//keywords initialization CHANGE to download different images
for (let i = 0; i < 20; i++) {
  keywords.push((i + 2014703221).toString());
}
keywords.push("afc1982009_te_027a");

const p = new Promise(() => updateImages(keywords));
p.finally();
