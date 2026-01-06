/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from '../AuthForm';

// Mock Supabase
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: (params: any) => mockSignInWithPassword(params),
            signUp: (params: any) => mockSignUp(params),
        },
    },
}));

describe('AuthForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSignInWithPassword.mockResolvedValue({ error: null });
        mockSignUp.mockResolvedValue({ error: null });
    });

    it('should render sign-in form by default', () => {
        render(<AuthForm />);

        expect(screen.getByText('Todo App')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });

    it('should toggle to sign-up mode when clicking Sign Up link', () => {
        render(<AuthForm />);

        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    });

    it('should toggle back to sign-in mode', () => {
        render(<AuthForm />);

        // Switch to sign up
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
        // Switch back to sign in
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
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
