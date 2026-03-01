const cache = require("../utils/cache");
const fetchArticles = require("../utils/fetchArticles");
const Article = require("../models/articleModel");
const User = require("../models/userModel");

const getNormalizedPreferences = (preferences) => {
  if (Array.isArray(preferences)) {
    return preferences.filter(
      (value) => typeof value === "string" && value.trim(),
    );
  }
  return [];
};

// GET /news
const getNews = async (req, res) => {
  try {
    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({ message: "News API key is not configured" });
    }

    const categories = getNormalizedPreferences(req.user?.preferences);
    const query = categories.length > 0 ? categories.join(" OR ") : "latest news";
    const cacheKey = `news:${query}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ news: cached, fromCache: true });
    }

    const news = await fetchArticles(query);
    await cache.set(cacheKey, news, { q: query });

    return res.status(200).json({ news, fromCache: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /news/:id/read
const markAsRead = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { readArticles: article._id },
    });

    return res.status(200).json({ message: "Article marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /news/:id/favorite
const markAsFavorite = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favoriteArticles: article._id },
    });

    return res.status(200).json({ message: "Article marked as favorite" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /news/read
const getReadArticles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("readArticles");
    return res.status(200).json({ readArticles: user.readArticles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /news/favorites
const getFavoriteArticles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteArticles");
    return res.status(200).json({ favoriteArticles: user.favoriteArticles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /news/search/:keyword
const searchNews = async (req, res) => {
  try {
    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({ message: "News API key is not configured" });
    }

    const keyword = req.params.keyword.trim();
    if (!keyword) {
      return res.status(400).json({ message: "Search keyword is required" });
    }

    const cacheKey = `search:${keyword}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ news: cached, fromCache: true });
    }

    const news = await fetchArticles(keyword);
    await cache.set(cacheKey, news, { q: keyword });

    return res.status(200).json({ news, fromCache: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getNews, searchNews, markAsRead, markAsFavorite, getReadArticles, getFavoriteArticles };
