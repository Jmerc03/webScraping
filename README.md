# webScraping

## About

A javaScript/node.js webscrapper to pull images off of the Library of Congress' website.
It creates a directory called photos and downloads photos there.

It also creates a info.json with all information about that photo.
The h3 header ids are the keys and the lis are the values.
When there are multiple lines they are stored in an array linked to the key.
This happens often with notes.

## Installation

Make sure you have [Node.js](https://nodejs.org/en) installed.
then clone repo and run:

```
npm install axios cheerio fs request
```

## Usage

Open project directory on ternimal and run:

```
node main.js
```

This will download 21 photos and store them in ./photos and store their info in a info.json.

To change what photos you want to download/scrape change the keywords array with the lccn numbers.
