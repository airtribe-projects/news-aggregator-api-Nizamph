const NewsAPI = require("newsapi");

const newsClient = new NewsAPI(process.env.NEWS_API_KEY);

console.log(
  "Initialized news client with API key:",
  !!process.env.NEWS_API_KEY,
);
module.exports = newsClient;
