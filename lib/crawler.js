'use strict';

const phantom   = require('phantom');

/**
 * Phantom timeout before start render page
 * @constant {Number}
 */
const TIMEOUT_BEFORE_RENDER = 300;

/**
 * Init Crawler
 * @return {Promise} Promise => renderPage(url) => Promise
 */
function createCrawler() {
  return new Promise((resolve, reject) => {
    phantom.create((ph) => {
      /**
       * Render page to html
       * @example
       * Promise returns object:
       * {
       *   status
       *   html
       * }
       * 
       * @param  {String} url
       * @return {Promise}
       */
      function _renderPage(url) {
        return new Promise((res, rej) => {
          ph.createPage((page) => {
            page.open(url, (status) => {
              /**
               * @todo  временное решение, ожидающее полной загрузки страницы.
               *        В будущем заменить на более адекватную реализацию.
               */
              setTimeout(() => {
                page.evaluate(function () {
                  return document.documentElement.outerHTML;
                }, function (html) {
                  res({
                    status: status,
                    html: html
                  });
                });
              }, TIMEOUT_BEFORE_RENDER);
            });
          });
        });
      };
      
      resolve(_renderPage);
    }, {
      dnodeOpts: {
        weak: false
      }
    });
  });
}

module.exports.createCrawler = createCrawler;
