// Shared image cache / fallback store for image uploads
const globalImageStore = globalThis.__rydaImageStore || new Map();
if (!globalThis.__rydaImageStore) {
  globalThis.__rydaImageStore = globalImageStore;
}

export function saveInMemoryImage(id, dataUrl) {
  globalImageStore.set(id, {
    dataUrl,
    timestamp: Date.now(),
  });
  // Cap at 100 images in memory
  if (globalImageStore.size > 100) {
    const oldestKey = globalImageStore.keys().next().value;
    globalImageStore.delete(oldestKey);
  }
}

export function getInMemoryImage(id) {
  const item = globalImageStore.get(id);
  return item ? item.dataUrl : null;
}
