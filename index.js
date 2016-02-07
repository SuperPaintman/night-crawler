'use strict';
/** Requires */
const express         = require('express');

const createCrawler   = require('./lib/crawler').createCrawler;

/** Constants */
const port            = process.env.NODE_PORT || 3000;
const environment     = process.env.NODE_ENV  || "development"; // production

createCrawler()
.then((renderPage) => {
  const app = express();

  app.get("/render/*", (req, res) => {
    let url = req.originalUrl;
    url = url.replace(/^\/render\//, '');

    console.log(`Start render ${url}`);

    renderPage(url)
    .then((data) => {
      console.log(`End render ${url}`);

      res.status(data.status).send(data.html);
    })
    .catch((err) => {
      console.error(err);

      res.sendStatus(500);
    });
  });

  app.listen(port, () => {
    console.log(`Crawler app listening on port ${port}!`);
  });
})
.catch((err) => {
  console.error(err);
});
