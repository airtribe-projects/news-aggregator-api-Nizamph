const express = require("express");
const {
  getNews,
  searchNews,
  markAsRead,
  markAsFavorite,
  getReadArticles,
  getFavoriteArticles,
} = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNews);
router.get("/read", protect, getReadArticles);
router.get("/favorites", protect, getFavoriteArticles);
router.get("/search/:keyword", protect, searchNews);
router.post("/:id/read", protect, markAsRead);
router.post("/:id/favorite", protect, markAsFavorite);

module.exports = router;
