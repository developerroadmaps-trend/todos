/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../AuthForm';

// Mock Supabase
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: (params: any) => mockSignInWithPassword(params),
            signUp: (params: any) => mockSignUp(params),
            resetPasswordForEmail: (...args: any[]) => mockResetPasswordForEmail(...args),
        },
    },
}));

describe('AuthForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSignInWithPassword.mockResolvedValue({ error: null });
        mockSignUp.mockResolvedValue({ error: null });
        mockResetPasswordForEmail.mockResolvedValue({ error: null });
    });

    it('should render sign-in form by default', () => {
        render(<AuthForm />);

        expect(screen.getByText('Todo App')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    });

    it('should toggle to sign-up mode when clicking Sign Up link', () => {
        render(<AuthForm />);

        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
        expect(screen.queryByText("Forgot Password?")).not.toBeInTheDocument();
    });

    it('should toggle back to sign-in mode', () => {
        render(<AuthForm />);

        // Switch to sign up
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
        // Switch back to sign in
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    });

    it('should toggle to forgot password mode', () => {
        render(<AuthForm />);

        fireEvent.click(screen.getByText("Forgot Password?"));

        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
        expect(screen.getByText("Back to Sign In")).toBeInTheDocument();
        expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    });

    it('should call resetPasswordForEmail on reset submit', async () => {
        render(<AuthForm />);

        fireEvent.click(screen.getByText("Forgot Password?"));
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'reset@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('reset@example.com');
    });

    it('should call signInWithPassword on sign in submit', async () => {
        render(<AuthForm />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should call signUp on sign up submit', async () => {
        render(<AuthForm />);

        // Switch to sign up
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'newpassword' } });

        // Get the submit button (not the toggle button)
        const buttons = screen.getAllByRole('button', { name: 'Sign Up' });
        const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit');
        fireEvent.click(submitButton!);

        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'new@example.com',
            password: 'newpassword',
        });
    });

    it('should display error message on auth failure', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: new Error('Invalid credentials') });

        render(<AuthForm />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
});
