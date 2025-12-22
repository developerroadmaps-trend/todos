// localStorage ラッパー - PostgreSQL-like API を模倣
// window.storage API をシミュレートして、コンポーネントで使用可能にします

export const initializeStorageAPI = () => {
  if (typeof window !== 'undefined' && !window.storage) {
    window.storage = {
      async get(key: string) {
        try {
          const value = localStorage.getItem(key);
          return value ? { value } : null;
        } catch (error) {
          console.error('Storage get error:', error);
          return null;
        }
      },
      async set(key: string, value: string) {
        try {
          localStorage.setItem(key, value);
          return { success: true };
        } catch (error) {
          console.error('Storage set error:', error);
          throw error;
        }
      },
      async delete(key: string) {
        try {
          localStorage.removeItem(key);
          return { success: true };
        } catch (error) {
          console.error('Storage delete error:', error);
          throw error;
        }
      },
    };
  }
};

// TypeScript 用の型定義
declare global {
  interface Window {
    storage?: {
      get(key: string): Promise<{ value: string } | null>;
      set(key: string, value: string): Promise<{ success: boolean }>;
      delete(key: string): Promise<{ success: boolean }>;
    };
  }
}

export {};
