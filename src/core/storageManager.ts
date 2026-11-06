export interface StorageItem {
  key: string;
  value: string;
  type: 'local' | 'session' | 'cookie';
}

export const getLocalStorageItems = (): StorageItem[] => {
  const items: StorageItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      items.push({ key, value: localStorage.getItem(key) || '', type: 'local' });
    }
  }
  return items;
};

export const getSessionStorageItems = (): StorageItem[] => {
  const items: StorageItem[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      items.push({ key, value: sessionStorage.getItem(key) || '', type: 'session' });
    }
  }
  return items;
};

export const getCookieItems = (): StorageItem[] => {
  if (!document.cookie) return [];
  return document.cookie.split('; ').map((cookie) => {
    const [key, ...val] = cookie.split('=');
    return {
      key: key.trim(),
      value: decodeURIComponent(val.join('=')),
      type: 'cookie'
    };
  });
};

export const deleteStorageItem = (key: string, type: 'local' | 'session' | 'cookie') => {
  if (type === 'local') {
    localStorage.removeItem(key);
  } else if (type === 'session') {
    sessionStorage.removeItem(key);
  } else if (type === 'cookie') {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

export const setStorageItem = (key: string, value: string, type: 'local' | 'session' | 'cookie') => {
  if (type === 'local') {
    localStorage.setItem(key, value);
  } else if (type === 'session') {
    sessionStorage.setItem(key, value);
  } else if (type === 'cookie') {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/;`;
  }
};