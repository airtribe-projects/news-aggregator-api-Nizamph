const User = require("../models/userModel");

// GET /preferences
const getPreferences = async (req, res) => {
  try {
    return res.status(200).json({ preferences: req.user.preferences });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /preferences
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!Array.isArray(preferences) || preferences.length === 0) {
      return res
        .status(400)
        .json({ message: "preferences must be a non-empty array of strings" });
    }

    if (!preferences.every((p) => typeof p === "string")) {
      return res
        .status(400)
        .json({ message: "preferences must be an array of strings" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, select: "preferences" },
    );

    return res.status(200).json({ preferences: updatedUser.preferences });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getPreferences, updatePreferences };
