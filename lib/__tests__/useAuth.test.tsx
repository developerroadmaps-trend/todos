/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Supabase
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
};

const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('../supabase', () => ({
    supabase: {
        auth: {
            getUser: () => mockGetUser(),
            signOut: () => mockSignOut(),
            onAuthStateChange: (callback: any) => {
                mockOnAuthStateChange(callback);
                return {
                    data: {
                        subscription: {
                            unsubscribe: jest.fn(),
                        },
                    },
                };
            },
        },
    },
}));

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
        mockSignOut.mockResolvedValue({ error: null });
    });

    it('should return loading: true initially', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(true);
    });

    it('should set user after successful auth check', async () => {
        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set user to null when not authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle auth error gracefully', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.error).toBe('Failed to get user');
    });

    it('should sign out user successfully', async () => {
        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.signOut();
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });
});
