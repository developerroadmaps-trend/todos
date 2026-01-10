import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setMessage('Signed in successfully!');
        setEmail('');
        setPassword('');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setMessage('Account created! Please check your email to verify.');
        setEmail('');
        setPassword('');
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        });

        if (error) throw error;
        setMessage('Password reset link sent! Please check your email.');
        setEmail('');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 sm:p-8 shadow-lg">
        <h1 className="mb-6 sm:mb-8 text-center text-xl sm:text-2xl font-bold text-gray-800">
          {mode === 'forgot_password' ? 'Reset Password' : 'Todo App'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot_password')}
                className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 p-2.5 sm:p-3">
              <p className="text-xs sm:text-sm text-green-800">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 py-2.5 sm:py-2 font-medium text-sm sm:text-base text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          {mode === 'forgot_password' ? (
            <p className="text-xs sm:text-sm text-gray-600">
              <button
                onClick={() => setMode('signin')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Back to Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-gray-600">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
