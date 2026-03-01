const newsClient = require("./newsClient");
const Article = require("../models/articleModel");

const RESULT_LIMIT = 10;

/**
 * Fetches articles from NewsAPI for the given query,
 * upserts them into MongoDB, and returns the mapped news array.
 */
const fetchArticles = async (query) => {
  const response = await newsClient.v2.everything({
    q: query,
    language: "en",
    sortBy: "publishedAt",
    pageSize: RESULT_LIMIT,
    page: 1,
  });

  if (!response || response.status !== "ok") {
    throw new Error(response?.message || "Failed to fetch news from NewsAPI");
  }

  const articles = Array.isArray(response.articles) ? response.articles : [];

  const news = await Promise.all(
    articles.map(async (article) => {
      if (!article?.url) {
        return null;
      }

      let hostname = article.url;
      try {
        hostname = new URL(article.url).hostname;
      } catch (_) {}

      const saved = await Article.findOneAndUpdate(
        { url: article.url },
        {
          title: article.title,
          summary: article.description || article.content || "",
          source: article.source?.name || hostname,
          url: article.url,
          publishedAt: article.publishedAt,
        },
        { upsert: true, new: true },
      );

      return {
        id: saved._id,
        title: saved.title,
        summary: saved.summary,
        source: saved.source,
        url: saved.url,
        publishedAt: saved.publishedAt,
      };
    }),
  );

  return news.filter(Boolean);
};

module.exports = fetchArticles;
