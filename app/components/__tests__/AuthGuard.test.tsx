/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthGuard from '../AuthGuard';

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock('@/lib/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock AuthForm
vi.mock('../AuthForm', () => ({
    default: function MockAuthForm() {
        return <div data-testid="auth-form">Auth Form</div>;
    },
}));

describe('AuthGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state when auth is loading', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            loading: true,
        });

        render(
            <AuthGuard>
                <div>Protected Content</div>
            </AuthGuard>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render AuthForm when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            loading: false,
        });

        render(
            <AuthGuard>
                <div>Protected Content</div>
            </AuthGuard>
        );

        expect(screen.getByTestId('auth-form')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            loading: false,
        });

        render(
            <AuthGuard>
                <div>Protected Content</div>
            </AuthGuard>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByTestId('auth-form')).not.toBeInTheDocument();
    });
});
