'use strict';
/** Requires */
const _               = require('lodash');

const createCrawler   = require('./lib/crawler').createCrawler;

/** Init crawler */
let renderPage;
createCrawler()
.then((fn) => {
  renderPage = fn;
})
.catch((err) => {
  console.error('Crawler can\'t start:', err)
});

/**
 * Detect bot by useragent
 * @param  {String} userAgent
 * 
 * @return {Boolean}
 */
function itIsBot(userAgent, req, res) {
  return !!(/bot|crawl|slurp|spider/i).test(userAgent);
};

/**
 * Crawler middleware
 * @param  {Object}         [options]
 * @param  {String}         [options.address="127.0.0.1"] - server addres. By default process.env.NODE_ADDRESS or "127.0.0.1"
 * @param  {String|Number}  [options.port=3000]           - server port. By default process.env.NODE_PORT or "3000"
 * @param  {String}         [options.scheme="http"]       - server scheme
 * @param  {Function}       [options.checkFn]             - check function for search bot. Example: check(userAgent, req, res)
 *
 * @return {Function}       - Middleware(req, res, next)
 */
module.exports = function (options) {
  const _options = options;

  options = _.merge({
    address:  process.env.NODE_ADDRESS  || "127.0.0.1",
    port:     process.env.NODE_PORT     || 3000,
    scheme:   "http",
    checkFn:  itIsBot
  }, options);

  return function crawler(req, res, next) {
    const userAgent = req.headers['user-agent'];

    /** detect search engine bots */
    if (renderPage && options.checkFn(userAgent, req, res)) {
      const url = `${
        options.scheme
      }://${
        options.address
      }:${
        options.port
      }${
        req.originalUrl
      }`;

      renderPage(url)
      .then((data) => {
        res.status(data.status).send(data.html);
      })
      .catch((err) => {
        /** Bypass */
        next();
      });
    } else {
      /** Bypass */
      next();
    }
  };
};
