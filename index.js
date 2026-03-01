require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
const cacheUpdater = require("./src/jobs/cacheUpdater");

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      cacheUpdater.start();
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
