/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initializeStorageAPI } from '../storage';

describe('initializeStorageAPI', () => {
    // Save original localStorage
    const originalLocalStorage = window.localStorage;
    let mockStorage: any;

    beforeEach(() => {
        // Create a mock storage implementation
        let store: Record<string, string> = {};
        mockStorage = {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value.toString();
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: vi.fn(() => {
                store = {};
            }),
            length: 0,
            key: vi.fn(),
        };

        // Replace window.localStorage with our mock
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            writable: true,
            configurable: true,
        });

        // Clear window.storage before each test
        delete (window as any).storage;
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original localStorage if needed
        // Object.defineProperty(window, 'localStorage', {
        //     value: originalLocalStorage,
        //     writable: true,
        //     configurable: true
        // });
    });

    it('should create window.storage when it does not exist', () => {
        expect(window.storage).toBeUndefined();
        initializeStorageAPI();
        expect(window.storage).toBeDefined();
    });

    it('should not override existing window.storage', () => {
        const existingStorage = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
        (window as any).storage = existingStorage;

        initializeStorageAPI();

        expect(window.storage).toBe(existingStorage);
    });

    describe('storage.get', () => {
        beforeEach(() => {
            initializeStorageAPI();
        });

        it('should return value from localStorage', async () => {
            mockStorage.setItem('testKey', 'testValue');

            const result = await window.storage!.get('testKey');

            expect(result).toEqual({ value: 'testValue' });
        });

        it('should return null for missing keys', async () => {
            const result = await window.storage!.get('nonexistentKey');

            expect(result).toBeNull();
        });
    });

    describe('storage.set', () => {
        beforeEach(() => {
            initializeStorageAPI();
        });

        it('should save value to localStorage', async () => {
            const result = await window.storage!.set('newKey', 'newValue');

            expect(result).toEqual({ success: true });
            expect(mockStorage.setItem).toHaveBeenCalledWith('newKey', 'newValue');
        });
    });

    describe('storage.delete', () => {
        beforeEach(() => {
            initializeStorageAPI();
        });

        it('should remove value from localStorage', async () => {
            mockStorage.setItem('keyToDelete', 'value');

            const result = await window.storage!.delete('keyToDelete');

            expect(result).toEqual({ success: true });
            expect(mockStorage.removeItem).toHaveBeenCalledWith('keyToDelete');
        });
    });
});
