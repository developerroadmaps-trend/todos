/**
 * @jest-environment jsdom
 */
import { initializeStorageAPI } from '../storage';

describe('initializeStorageAPI', () => {
    beforeEach(() => {
        // Clear window.storage before each test
        delete (window as any).storage;
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should create window.storage when it does not exist', () => {
        expect(window.storage).toBeUndefined();
        initializeStorageAPI();
        expect(window.storage).toBeDefined();
    });

    it('should not override existing window.storage', () => {
        const existingStorage = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
        (window as any).storage = existingStorage;

        initializeStorageAPI();

        expect(window.storage).toBe(existingStorage);
    });

    describe('storage.get', () => {
        beforeEach(() => {
            initializeStorageAPI();
        });

        it('should return value from localStorage', async () => {
            localStorage.setItem('testKey', 'testValue');

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
            expect(localStorage.setItem).toHaveBeenCalledWith('newKey', 'newValue');
        });
    });

    describe('storage.delete', () => {
        beforeEach(() => {
            initializeStorageAPI();
        });

        it('should remove value from localStorage', async () => {
            localStorage.setItem('keyToDelete', 'value');

            const result = await window.storage!.delete('keyToDelete');

            expect(result).toEqual({ success: true });
            expect(localStorage.removeItem).toHaveBeenCalledWith('keyToDelete');
        });
    });
});
