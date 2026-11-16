import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import type { Session } from '../types';
import { Button } from '../components/ui/Button';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Moon,
  Sun,
  User as UserIcon,
  CheckCircle2,
  Calendar,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { formatDate, formatRelativeTime, cn } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await apiClient.get('/auth/sessions');
      if (res.data?.success) {
        setSessions(res.data.data.sessions);
        setCurrentSessionId(res.data.data.currentSessionId);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      if (sessionId === currentSessionId) {
        await logout();
        navigate('/login');
      } else {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      await apiClient.delete('/auth/sessions');
      fetchSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiClient.delete('/auth/account');
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account', err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-warm-border/60 dark:border-warm-border-dark/60 pb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-forest-700 dark:text-forest-400 font-semibold">
          Preferences & Security
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-ink-primary dark:text-ink-dark-primary mt-1">
          Account Settings
        </h1>
        <p className="text-sm text-ink-muted dark:text-ink-dark-muted mt-1.5 leading-relaxed">
          Manage your account profile, visual theme appearance, and active device sessions.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-warm-surface dark:bg-warm-surface-dark border border-warm-border dark:border-warm-border-dark shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-900/60 flex items-center justify-center text-forest-700 dark:text-forest-400">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink-primary dark:text-ink-dark-primary">
              Profile Overview
            </h2>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted">
              Primary identification details associated with your Shelfspace library.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-warm-bg dark:bg-warm-bg-dark border border-warm-border/80 dark:border-warm-border-dark/80">
            <span className="text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted block mb-1">
              Full Name
            </span>
            <span className="font-semibold text-ink-primary dark:text-ink-dark-primary text-sm">
              {user?.name || 'Shelfspace User'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-warm-bg dark:bg-warm-bg-dark border border-warm-border/80 dark:border-warm-border-dark/80">
            <span className="text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-primary dark:text-ink-dark-primary text-sm truncate">
                {user?.email}
              </span>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-100/70 dark:bg-forest-950/60 text-forest-800 dark:text-forest-300 border border-forest-300/60 dark:border-forest-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-forest-600 dark:text-forest-400" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-ink-muted dark:text-ink-dark-muted pt-4 border-t border-warm-border/60 dark:border-warm-border-dark/60 flex items-center gap-2 font-mono">
          <Calendar className="w-3.5 h-3.5 text-ink-muted" />
          <span>Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-warm-surface dark:bg-warm-surface-dark border border-warm-border dark:border-warm-border-dark shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink-primary dark:text-ink-dark-primary">
            Interface Appearance
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1">
            Choose between warm ivory light mode, deep charcoal dark mode, or system default.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'light'
                ? 'border-forest-700 bg-forest-50/60 text-forest-900 font-semibold shadow-xs'
                : 'border-warm-border dark:border-warm-border-dark bg-warm-bg dark:bg-warm-bg-dark hover:border-ink-muted text-ink-primary dark:text-ink-dark-primary'
            )}
          >
            <Sun className="w-5 h-5 text-amber-600" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'dark'
                ? 'border-forest-400 bg-forest-950/40 text-forest-300 font-semibold shadow-xs'
                : 'border-warm-border dark:border-warm-border-dark bg-warm-bg dark:bg-warm-bg-dark hover:border-ink-muted text-ink-primary dark:text-ink-dark-primary'
            )}
          >
            <Moon className="w-5 h-5 text-forest-400" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'system'
                ? 'border-forest-700 dark:border-forest-400 bg-forest-50/60 dark:bg-forest-950/40 text-forest-900 dark:text-forest-300 font-semibold shadow-xs'
                : 'border-warm-border dark:border-warm-border-dark bg-warm-bg dark:bg-warm-bg-dark hover:border-ink-muted text-ink-primary dark:text-ink-dark-primary'
            )}
          >
            <Laptop className="w-5 h-5 text-ink-muted" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-warm-surface dark:bg-warm-surface-dark border border-warm-border dark:border-warm-border-dark shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-900/60 flex items-center justify-center text-forest-700 dark:text-forest-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-primary dark:text-ink-dark-primary">
                Active Sessions
              </h2>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted">
                Authenticated browsers and devices holding an active session.
              </p>
            </div>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleRevokeAllOtherSessions}
              isLoading={isRevokingAll}
              className="text-xs"
            >
              Revoke Other Sessions
            </Button>
          )}
        </div>

        {isLoadingSessions ? (
          <div className="py-8 text-center text-xs text-ink-muted dark:text-ink-dark-muted font-mono">
            Loading session security details...
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((sess) => {
              const isCurrent = sess._id === currentSessionId;
              const isMobile = /mobile|android|iphone/i.test(sess.userAgent);

              return (
                <div
                  key={sess._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-warm-border/80 dark:border-warm-border-dark/80 bg-warm-bg/70 dark:bg-warm-bg-dark/60 text-xs transition-colors hover:border-forest-600/30"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-warm-surface dark:bg-warm-surface-dark border border-warm-border dark:border-warm-border-dark flex items-center justify-center text-ink-primary dark:text-ink-dark-primary">
                      {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium text-ink-primary dark:text-ink-dark-primary">
                        <span className="truncate max-w-xs text-xs font-mono">{sess.userAgent}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-950/70 text-forest-800 dark:text-forest-300 font-semibold border border-forest-300 dark:border-forest-800">
                            Current Device
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-ink-muted dark:text-ink-dark-muted flex items-center gap-2 mt-1 font-mono">
                        <span>IP: {sess.ipAddress}</span>
                        <span>•</span>
                        <span>Active {formatRelativeTime(sess.lastActiveAt)}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleRevokeSession(sess._id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-mono"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 sm:p-7 rounded-2xl bg-red-50/40 dark:bg-red-950/15 border border-red-200/60 dark:border-red-900/40 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
              Danger Zone: Account Deletion
            </h2>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted leading-relaxed">
              Deleting your account terminates all active sessions immediately. With the built-in{' '}
              <strong className="text-ink-primary dark:text-ink-dark-primary font-semibold">30-day grace period</strong>,
              you can recover your library anytime by signing back in within 30 days. After that period,
              all stored resources, projects, and collections will be wiped forever.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteAccountOpen(true)}
            className="flex items-center gap-2 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Request Account Deletion
          </Button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteAccountOpen}
        title="Schedule Account Deletion?"
        message="Your account will enter a 30-day grace period. If you log back in within 30 days, your account will be immediately restored. Otherwise, all resources will be permanently removed."
        confirmText="Schedule Deletion"
        isPermanent
        isLoading={isDeletingAccount}
        onCancel={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};
