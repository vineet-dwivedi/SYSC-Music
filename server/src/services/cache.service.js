const CACHE_KEYS = Object.freeze({
  TRACKS_LIST: 'tracks:list',
  PLAYLISTS_LIST: 'playlists:list',
});

const cacheStore = new Map();
const inFlightLoads = new Map();

const getCachedValue = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

const setCachedValue = (key, value, ttlMs) => {
  const safeTtl = Math.max(1, Number(ttlMs) || 1);
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + safeTtl,
  });
  return value;
};

const invalidateCache = (key) => {
  cacheStore.delete(key);
};

const invalidateMany = (keys = []) => {
  keys.forEach((key) => invalidateCache(key));
};

const withCache = async (key, ttlMs, load) => {
  const cached = getCachedValue(key);
  if (cached !== null) return cached;

  const running = inFlightLoads.get(key);
  if (running) return running;

  const promise = Promise.resolve(load())
    .then((value) => setCachedValue(key, value, ttlMs))
    .finally(() => {
      inFlightLoads.delete(key);
    });

  inFlightLoads.set(key, promise);
  return promise;
};

export { CACHE_KEYS, invalidateCache, invalidateMany, withCache };
