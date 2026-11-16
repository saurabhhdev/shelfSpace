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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#faf8f5] dark:bg-[#121110] text-[#191715] dark:text-[#f5f2ec] transition-colors duration-200">
      {/* Return to Landing Page */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shelfspace</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1e3a2f] dark:bg-[#2d5d45] text-[#f5f2ec] font-bold flex items-center justify-center text-base shadow-xs border border-[#142820] dark:border-[#3d7d5d]/40 mb-3">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec]">
            {isLogin ? 'Sign in to Shelfspace' : 'Create your workspace'}
          </h1>
          <p className="text-xs text-[#8a8277] mt-1">
            {isLogin
              ? 'Access your private developer resource library'
              : 'Keep, organize, and reuse your developer discoveries'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] rounded-2xl shadow-sm p-6 sm:p-8">
          {forgotPasswordOpen ? (
            <div>
              <h2 className="text-base font-semibold mb-1">Reset Password</h2>
              <p className="text-xs text-[#8a8277] mb-5">
                Enter your account email to receive a password recovery token.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-10 h-10 text-[#1e3a2f] dark:text-[#86efac] mx-auto mb-2.5" />
                  <p className="text-sm font-medium text-[#191715] dark:text-[#f5f2ec]">
                    Reset link generated
                  </p>
                  <p className="text-xs text-[#8a8277] mt-1 mb-5">
                    If an account exists with this email, the token has been processed.
                  </p>
                  <Button
                    variant="outline"
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
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400">
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

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Send Reset Token
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full text-center text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] mt-2 cursor-pointer"
                  >
                    Cancel and return
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-lg bg-[#f5f2eb] dark:bg-[#201e1b] p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMessage('');
                  }}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer',
                    isLogin
                      ? 'bg-white dark:bg-[#191816] text-[#191715] dark:text-[#f5f2ec] shadow-xs'
                      : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
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
                      ? 'bg-white dark:bg-[#191816] text-[#191715] dark:text-[#f5f2ec] shadow-xs'
                      : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
                  )}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {!isLogin && (
                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Linus Torvalds"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                  </div>
                )}

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="developer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    hint={
                      !isLogin
                        ? 'Min 8 chars, at least one uppercase letter and number'
                        : undefined
                    }
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen(true);
                        setErrorMessage('');
                      }}
                      className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isLogin ? 'Sign In to Workspace' : 'Create Free Workspace'}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Demo Account Hint */}
        <div className="mt-4 p-3 rounded-xl bg-[#f5f2eb]/70 dark:bg-[#191816]/70 border border-[#ded8cb] dark:border-[#2f2c27] text-center text-[11px] text-[#8a8277]">
          <span>Demo Account: </span>
          <span className="font-mono text-[#191715] dark:text-[#f5f2ec]">demo@shelfspace.dev</span>
          <span> / </span>
          <span className="font-mono text-[#191715] dark:text-[#f5f2ec]">Password123!</span>
        </div>
      </div>
    </div>
  );
};
