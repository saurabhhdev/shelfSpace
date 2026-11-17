import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import { cn } from '../lib/utils';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setResetSent(true);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0E0F10] text-[#E5E5E5] selection:bg-[#09AE5B] selection:text-black font-sans">
      {/* Return to Landing Page */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shelfspace</span>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-8 h-8 rounded-md bg-[#16171b] border border-white/[0.08] flex items-center justify-center mb-3">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#09AE5B]"></span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {isLogin ? 'Sign in to Shelfspace' : 'Create an account'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isLogin
              ? 'Enter your credentials to access your library'
              : 'Start organizing your developer resources and notes'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-6 relative">
          {forgotPasswordOpen ? (
            <div>
              <h2 className="text-sm font-semibold mb-1 text-white">Reset Password</h2>
              <p className="text-xs text-neutral-400 mb-5">
                Enter your account email to receive a password recovery token.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-8 h-8 text-[#09AE5B] mx-auto mb-2" />
                  <p className="text-xs font-medium text-white">
                    Reset link generated
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 mb-5">
                    If an account exists with this email, the token has been processed.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setResetSent(false);
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400">
                      {errorMessage}
                    </div>
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                    placeholder="developer@domain.com"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Send Reset Token
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full text-center text-xs text-neutral-400 hover:text-white mt-2 cursor-pointer transition-colors"
                  >
                    Cancel and return
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-md bg-[#0E0F10] p-1 mb-5 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMessage('');
                  }}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer',
                    isLogin
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:text-white'
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMessage('');
                  }}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer',
                    !isLogin
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:text-white'
                  )}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {!isLogin && (
                  <div>
                    <Input
                      label="Your Name"
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      leftIcon={<UserIcon className="w-4 h-4 text-neutral-400" />}
                    />
                  </div>
                )}

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="developer@shelfspace.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-neutral-300">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordOpen(true);
                          setErrorMessage('');
                        }}
                        className="text-[11px] text-neutral-400 hover:text-white cursor-pointer transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  {!isLoading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </form>

              {/* Demo Hint */}
              <div className="mt-5 pt-3 border-t border-white/[0.06] text-center text-[11px] text-neutral-400">
                Demo: <span className="text-neutral-300 font-mono">demo@shelfspace.dev</span> / <span className="text-neutral-300 font-mono">Password123!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
