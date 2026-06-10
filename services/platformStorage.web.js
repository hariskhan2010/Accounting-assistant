const memoryStorage = new Map();

function createMemoryStorage() {
  return {
    getItem: async (key) => memoryStorage.get(key) || null,
    setItem: async (key, value) => {
      memoryStorage.set(key, value);
    },
    removeItem: async (key) => {
      memoryStorage.delete(key);
    }
  };
}

function createLocalStorage() {
  return {
    getItem: async (key) => window.localStorage.getItem(key),
    setItem: async (key, value) => {
      window.localStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      window.localStorage.removeItem(key);
    }
  };
}

export function createPlatformStorage() {
  return typeof window === "undefined" ? createMemoryStorage() : createLocalStorage();
}
