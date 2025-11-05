import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { BeakerIcon } from '@heroicons/react/24/outline';

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as 'patient' | 'researcher') || 'patient';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'researcher'>(initialType);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, userType);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to appropriate onboarding based on user type
      setTimeout(() => {
        if (userType === 'researcher') {
          navigate('/researcher/onboarding');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
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
          <h2 className="text-3xl font-bold text-neutral-darkest mb-2">Create Account</h2>
          <p className="text-neutral-dark mb-6">Join thousands of patients and researchers</p>

          {success ? (
            <div className="p-4 bg-primary/10 border border-primary rounded-xl text-center">
              <p className="text-primary font-semibold mb-2">Account Created!</p>
              <p className="text-sm text-neutral-dark">Check your email to verify your account. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-darkest mb-2">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('patient')}
                    className={`p-4 rounded-xl border-2 transition ${
                      userType === 'patient'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-neutral-light text-neutral-dark hover:border-neutral-medium'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">👥</div>
                      <div className="font-semibold">Patient/Caregiver</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('researcher')}
                    className={`p-4 rounded-xl border-2 transition ${
                      userType === 'researcher'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-neutral-light text-neutral-dark hover:border-neutral-medium'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔬</div>
                      <div className="font-semibold">Researcher</div>
                    </div>
                  </button>
                </div>
              </div>

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
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-darkest mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-neutral-dark">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
