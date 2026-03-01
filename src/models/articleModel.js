const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    source: { type: String },
    url: { type: String, required: true, unique: true },
    publishedAt: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Article", articleSchema);
