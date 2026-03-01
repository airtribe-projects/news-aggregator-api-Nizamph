const TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map();

const get = async (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
};

const set = async (key, data, meta = {}) => {
  store.set(key, { data, meta, expiresAt: Date.now() + TTL_MS });
};

// Returns all non-expired entries as [{ key, meta }]
const keys = () => {
  const now = Date.now();
  const result = [];
  for (const [key, entry] of store.entries()) {
    if (now <= entry.expiresAt) {
      result.push({ key, meta: entry.meta });
    } else {
      store.delete(key);
    }
  }
  return result;
};

module.exports = { get, set, keys };
