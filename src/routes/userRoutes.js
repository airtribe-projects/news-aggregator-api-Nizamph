const express = require("express");
const {
  getPreferences,
  updatePreferences,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/preferences", protect, getPreferences);
router.put("/preferences", protect, updatePreferences);

module.exports = router;
