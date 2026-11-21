import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flaticon } from '../components/ui/Flaticon';
import { cn } from '../lib/utils';
import { ShelfspaceLogoIcon } from '../components/ui/ShelfspaceLogo';
import { Alert } from '../components/ui/Alert';

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(location.pathname !== '/register');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync state with URL path
  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
    setErrorMessage('');
  }, [location.pathname]);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Password requirement checks (matching backend Zod registerSchema)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage('');

    // Pre-flight client validations for pleasant UX
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isLogin) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters).');
        return;
      }

      if (!isPasswordValid) {
        setErrorMessage('Password must be at least 8 characters and include at least one uppercase letter and one number.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and try again.');
        return;
      }
    } else {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || err.message;
      if (serverMsg) {
        setErrorMessage(serverMsg);
      } else {
        setErrorMessage('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@shelfspace.dev');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setErrorMessage('');
    navigate(loginMode ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#262624] text-[#FAF9F5] selection:bg-[#D97757] selection:text-white font-sans relative overflow-x-hidden">
      {/* Precision Dotted Background Overlay (Preserves #262624 theme continuity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
          backgroundBlendMode: 'overlay',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top utility row */}
      <div className="w-full max-w-[420px] mb-5 flex items-center justify-between z-10 relative">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#B7B5A9] hover:text-[#FAF9F5] transition-colors py-1 group select-none"
        >
          <Flaticon name="angle-small-left" className="text-xs group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Shelfspace</span>
        </Link>
        <span className="text-[11px] font-mono text-[#B7B5A9]/50 select-none">Free & Open Source</span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[420px] z-10 relative">
        <div className="bg-[#1C1C1B] border border-[#3E3E38] rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)] relative backdrop-blur-sm">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group select-none" title="Shelfspace">
              <ShelfspaceLogoIcon size={32} />
              <span className="text-lg font-bold tracking-tight text-[#FAF9F5]">Shelfspace</span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF9F5]">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#B7B5A9] mt-1.5 max-w-xs text-balance">
              {isLogin
                ? 'Sign in to continue managing your resources.'
                : 'Get your developer resources organized in one place.'}
            </p>
          </div>

          <div>
            {/* Sleek Segmented Switch (Sign In vs Create Account) */}
            <div className="grid grid-cols-2 p-1 bg-[#141413] rounded-lg border border-[#3E3E38]/80 mb-5 text-xs font-medium select-none">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={cn(
                  'py-2 rounded-md transition-all duration-150 cursor-pointer font-medium text-center',
                  isLogin
                    ? 'bg-[#1C1C1B] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                    : 'text-[#B7B5A9] hover:text-[#FAF9F5]'
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={cn(
                  'py-2 rounded-md transition-all duration-150 cursor-pointer font-medium text-center',
                  !isLogin
                    ? 'bg-[#1C1C1B] text-[#FAF9F5] shadow-xs border border-[#3E3E38]'
                    : 'text-[#B7B5A9] hover:text-[#FAF9F5]'
                )}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <Alert
                variant="error"
                onDismiss={() => setErrorMessage('')}
                className="mb-4"
              >
                {errorMessage}
              </Alert>
            )}

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input (Signup only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-name" className="block text-xs font-medium text-[#FAF9F5]">
                    Full Name <span className="text-[#D97757]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#B7B5A9] pointer-events-none flex items-center">
                      <Flaticon name="user" className="text-xs" />
                    </div>
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Alex Rivera"
                      required
                      className="w-full h-10 rounded-md pl-9 pr-3 text-sm bg-[#141413] text-[#FAF9F5] border border-[#3E3E38] placeholder:text-neutral-500 focus:outline-none focus:border-[#FAF9F5]/70 focus:ring-1 focus:ring-[#FAF9F5]/20 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="block text-xs font-medium text-[#FAF9F5]">
                  Email Address <span className="text-[#D97757]">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#B7B5A9] pointer-events-none flex items-center">
                    <Flaticon name="envelope" className="text-xs" />
                  </div>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="you@example.com"
                    required
                    className="w-full h-10 rounded-md pl-9 pr-3 text-sm bg-[#141413] text-[#FAF9F5] border border-[#3E3E38] placeholder:text-neutral-500 focus:outline-none focus:border-[#FAF9F5]/70 focus:ring-1 focus:ring-[#FAF9F5]/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-[#FAF9F5]">
                  Password <span className="text-[#D97757]">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#B7B5A9] pointer-events-none flex items-center">
                    <Flaticon name="lock" className="text-xs" />
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder={isLogin ? '••••••••' : 'Create a strong password'}
                    required
                    className="w-full h-10 rounded-md pl-9 pr-10 text-sm bg-[#141413] text-[#FAF9F5] border border-[#3E3E38] placeholder:text-neutral-500 focus:outline-none focus:border-[#FAF9F5]/70 focus:ring-1 focus:ring-[#FAF9F5]/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#B7B5A9] hover:text-[#FAF9F5] p-1 cursor-pointer transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <Flaticon name="eye-crossed" className="text-xs" />
                    ) : (
                      <Flaticon name="eye" className="text-xs" />
                    )}
                  </button>
                </div>

                {/* Password Requirement Chips (Signup only) */}
                {!isLogin && password.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5 text-[10px] select-none">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors',
                        hasMinLength
                          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 font-medium'
                          : 'bg-[#141413] border-[#3E3E38] text-[#B7B5A9]'
                      )}
                    >
                      {hasMinLength ? '✓' : '•'} 8+ characters
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors',
                        hasUppercase
                          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 font-medium'
                          : 'bg-[#141413] border-[#3E3E38] text-[#B7B5A9]'
                      )}
                    >
                      {hasUppercase ? '✓' : '•'} 1 uppercase
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors',
                        hasNumber
                          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 font-medium'
                          : 'bg-[#141413] border-[#3E3E38] text-[#B7B5A9]'
                      )}
                    >
                      {hasNumber ? '✓' : '•'} 1 number
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input (Signup only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-[#FAF9F5]">
                    Confirm Password <span className="text-[#D97757]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-[#B7B5A9] pointer-events-none flex items-center">
                      <Flaticon name="lock" className="text-xs" />
                    </div>
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Re-enter your password"
                      required
                      className={cn(
                        'w-full h-10 rounded-md pl-9 pr-10 text-sm bg-[#141413] text-[#FAF9F5] border placeholder:text-neutral-500 focus:outline-none transition-colors',
                        !passwordsMatch
                          ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                          : 'border-[#3E3E38] focus:border-[#FAF9F5]/70 focus:ring-1 focus:ring-[#FAF9F5]/20'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-[#B7B5A9] hover:text-[#FAF9F5] p-1 cursor-pointer transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <Flaticon name="eye-crossed" className="text-xs" />
                      ) : (
                        <Flaticon name="eye" className="text-xs" />
                      )}
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <p className="text-[11px] text-rose-400 mt-1">Passwords do not match.</p>
                  )}
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] text-sm font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#141413] border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <Flaticon name="angle-small-right" className="text-xs" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Mode Switch Link */}
            <div className="mt-5 text-center text-xs text-[#B7B5A9]">
              {isLogin ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className="text-[#FAF9F5] font-semibold hover:underline cursor-pointer transition-colors"
                  >
                    Create one
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className="text-[#FAF9F5] font-semibold hover:underline cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>

            {/* One-click Demo Credentials Helper (Login mode only) */}
            {isLogin && (
              <div className="mt-5 pt-4 border-t border-[#3E3E38]/70 flex items-center justify-between text-[11px] text-[#B7B5A9]">
                <span>Testing Shelfspace?</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[#D97757] hover:text-[#EE8360] font-medium cursor-pointer transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Fill Demo Account</span>
                  <Flaticon name="arrow-small-right" className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
