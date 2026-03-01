const cache = require("../utils/cache");
const fetchArticles = require("../utils/fetchArticles");

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const refreshCache = async () => {
  if (!process.env.NEWS_API_KEY) return;

  const activeEntries = cache.keys();
  if (activeEntries.length === 0) return;

  console.log(`[CacheUpdater] Refreshing ${activeEntries.length} cached queries...`);

  for (const { key, meta } of activeEntries) {
    const { q } = meta;
    if (!q) continue;

    try {
      const news = await fetchArticles(q);
      await cache.set(key, news, { q });
      console.log(`[CacheUpdater] Refreshed: "${key}"`);
    } catch (err) {
      console.error(`[CacheUpdater] Failed to refresh "${key}":`, err.message);
    }
  }
};

const start = () => {
  setInterval(refreshCache, REFRESH_INTERVAL_MS);
  console.log(`[CacheUpdater] Started — refresh interval: ${REFRESH_INTERVAL_MS / 1000}s`);
};

module.exports = { start };
