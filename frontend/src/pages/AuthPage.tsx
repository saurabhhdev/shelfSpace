import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { cn } from '../lib/utils';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/library';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl shadow-md border border-blue-500/30 mb-3">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Shelfspace
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Personal Developer Resource Management Workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl p-6 sm:p-8">
          {forgotPasswordOpen ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
              <p className="text-xs text-zinc-500 mb-6">
                Enter your account email to receive a password recovery token.
              </p>

              {resetSent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Reset token generated
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 mb-6">
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
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400">
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
                    placeholder="you@domain.com"
                  />

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Send Reset Token
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mt-2"
                  >
                    Cancel and return to login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMessage('');
                  }}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                    isLogin
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
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
                    'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                    !isLogin
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  )}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Ada Lovelace"
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                    hint={
                      !isLogin
                        ? 'Min 8 chars, at least one uppercase letter and number'
                        : undefined
                    }
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen(true);
                        setErrorMessage('');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
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

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          Shelfspace — Keep, organize, and reuse developer resources.
        </p>
      </div>
    </div>
  );
};
