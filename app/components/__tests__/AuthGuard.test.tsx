/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthGuard from '../AuthGuard';

// Mock useAuth hook
const mockUseAuth = jest.fn();

jest.mock('@/lib/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock AuthForm
jest.mock('../AuthForm', () => {
    return function MockAuthForm() {
        return <div data-testid="auth-form">Auth Form</div>;
    };
});

describe('AuthGuard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
