import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import { cn } from '../lib/utils';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
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
  const location = useLocation();

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fbfbfa] dark:bg-[#0d0d0f] text-[#2b2a28] dark:text-[#f4f4f5] transition-colors duration-150">
      {/* Return to Landing Page */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shelfspace</span>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#191919] dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-sm shadow-xs mb-3">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            {isLogin ? 'Sign in to Shelfspace' : 'Create your workspace'}
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            {isLogin
              ? 'Access your private developer resource library'
              : 'Collect, organize, and reuse your developer tools and ideas'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] rounded-2xl shadow-2xs p-6 sm:p-7">
          {forgotPasswordOpen ? (
            <div>
              <h2 className="text-sm font-semibold mb-1">Reset Password</h2>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mb-5">
                Enter your account email to receive a password recovery token.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5]">
                    Reset link generated
                  </p>
                  <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1 mb-5">
                    If an account exists with this email, the token has been processed.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
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
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400">
                      {errorMessage}
                    </div>
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4" />}
                    placeholder="developer@domain.com"
                  />

                  <Button type="submit" variant="primary" pill className="w-full text-xs" isLoading={isLoading}>
                    Send Reset Token
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full text-center text-xs text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white mt-2 cursor-pointer"
                  >
                    Cancel and return
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-lg bg-[#f0f0ee] dark:bg-[#202026] p-1 mb-5 border border-[#e5e5e3] dark:border-[#2a2a34]">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMessage('');
                  }}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer',
                    isLogin
                      ? 'bg-white dark:bg-[#2a2a34] text-[#191919] dark:text-white shadow-xs font-semibold'
                      : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
                  )}
                >
                  Log In
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
                      ? 'bg-white dark:bg-[#2a2a34] text-[#191919] dark:text-white shadow-xs font-semibold'
                      : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
                  )}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400">
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
                      leftIcon={<UserIcon className="w-4 h-4" />}
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
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordOpen(true);
                          setErrorMessage('');
                        }}
                        className="text-[11px] text-[#787774] dark:text-[#a1a1aa] hover:text-[#2b2a28] dark:hover:text-white cursor-pointer"
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
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  pill
                  className="w-full text-xs h-9 mt-2"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {isLogin ? 'Sign In to Workspace' : 'Get Started Free'}
                </Button>
              </form>

              {/* Demo Hint */}
              <div className="mt-4 pt-3 border-t border-[#ececeb] dark:border-[#26262c] text-center text-[11px] text-[#8e8d8a] font-mono">
                Demo access: <span className="text-[#2b2a28] dark:text-[#f4f4f5]">demo@shelfspace.dev</span> / <span className="text-[#2b2a28] dark:text-[#f4f4f5]">Password123!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
