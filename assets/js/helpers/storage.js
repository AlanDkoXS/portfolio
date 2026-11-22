// Safe access to Web Storage. Both the storage getter itself (blocked cookies,
// sandboxed frames) and setItem (quota) can throw; no caller needs the error,
// only whether it worked: reads fall back to null and writes report success.
const safeStorage = (getArea) => ({
  /** Stored string, or null when the key is missing or storage is unavailable. */
  get(key) {
    try {
      return getArea().getItem(key);
    } catch {
      return null;
    }
  },

  /** Stores the value; false when it couldn't be stored. */
  set(key, value) {
    try {
      getArea().setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  /** Removes the key; false when storage is unavailable. */
  remove(key) {
    try {
      getArea().removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
});

export const localStore = safeStorage(() => localStorage);
export const sessionStore = safeStorage(() => sessionStorage);
