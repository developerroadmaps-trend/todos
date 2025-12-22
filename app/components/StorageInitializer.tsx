'use client';

import { useEffect } from 'react';

export function StorageInitializer() {
  useEffect(() => {
    // window.storage API を初期化
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
  }, []);

  return null;
}
