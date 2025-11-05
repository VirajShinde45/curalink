import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { BeakerIcon } from '@heroicons/react/24/outline';

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Redirect to dashboard
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-lightest to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-darkest">CuraLink</h1>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-medium p-8">
          <h2 className="text-3xl font-bold text-neutral-darkest mb-2">Welcome Back</h2>
          <p className="text-neutral-dark mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-darkest mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-darkest mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your password"
              />
            </div>

            {error && (
              <div className="p-3 bg-secondary-red/10 border border-secondary-red rounded-xl text-secondary-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-dark">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
