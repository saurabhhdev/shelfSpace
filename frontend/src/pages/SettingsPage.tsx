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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
          <span>Preferences</span>
          <span>•</span>
          <span>Security</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
          Account Settings
        </h1>
        <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
          Manage your account profile, visual appearance, active devices, and privacy.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">
              Profile Details
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">
              Primary credentials for your Shelfspace account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f7f7f5] dark:bg-[#131316] border border-[#ececeb] dark:border-[#26262c]">
            <span className="text-[11px] font-medium text-[#8e8d8a] dark:text-[#71717a] block mb-1">
              Full Name
            </span>
            <span className="font-semibold text-[#2b2a28] dark:text-[#f4f4f5] text-sm">
              {user?.name || 'Shelfspace User'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f7f7f5] dark:bg-[#131316] border border-[#ececeb] dark:border-[#26262c]">
            <span className="text-[11px] font-medium text-[#8e8d8a] dark:text-[#71717a] block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2b2a28] dark:text-[#f4f4f5] text-sm truncate">
                {user?.email}
              </span>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] pt-3 border-t border-[#f1f1ef] dark:border-[#222227] flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">
            Interface Appearance
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-0.5">
            Choose light workspace, deep dark mode, or system default.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'light'
                ? 'border-[#191919] bg-[#f0f0ee] text-[#191919] font-semibold shadow-2xs'
                : 'border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#131316] hover:border-[#cfcfcc] text-[#5f5e5b] dark:text-[#a1a1aa]'
            )}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'dark'
                ? 'border-white bg-[#22222a] text-white font-semibold shadow-2xs'
                : 'border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#131316] hover:border-[#cfcfcc] text-[#5f5e5b] dark:text-[#a1a1aa]'
            )}
          >
            <Moon className="w-4 h-4 text-amber-400" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer',
              theme === 'system'
                ? 'border-[#191919] dark:border-white bg-[#f0f0ee] dark:bg-[#22222a] text-[#191919] dark:text-white font-semibold shadow-2xs'
                : 'border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#131316] hover:border-[#cfcfcc] text-[#5f5e5b] dark:text-[#a1a1aa]'
            )}
          >
            <Laptop className="w-4 h-4 text-[#8e8d8a]" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">
                Active Device Sessions
              </h2>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">
                Authenticated browsers and devices holding access to your library.
              </p>
            </div>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              pill
              onClick={handleRevokeAllOtherSessions}
              isLoading={isRevokingAll}
              className="text-xs"
            >
              Revoke Other Devices
            </Button>
          )}
        </div>

        {isLoadingSessions ? (
          <div className="py-6 text-center text-xs text-[#8e8d8a] font-mono">
            Loading session security details...
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((sess) => {
              const isCurrent = sess._id === currentSessionId;
              const isMobile = /mobile|android|iphone/i.test(sess.userAgent);

              return (
                <div
                  key={sess._id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-[#fbfbfa] dark:bg-[#131316] text-xs transition-colors hover:border-[#cfcfcc]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] flex items-center justify-center text-[#2b2a28] dark:text-[#f4f4f5]">
                      {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium text-[#2b2a28] dark:text-[#f4f4f5]">
                        <span className="truncate max-w-xs text-xs font-mono">{sess.userAgent}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                            Current Device
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] flex items-center gap-2 mt-0.5 font-mono">
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
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-mono"
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
      <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-900/40 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              Danger Zone: Account Deletion
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
              Deleting your account terminates all active sessions immediately. With the built-in{' '}
              <strong className="text-[#2b2a28] dark:text-[#f4f4f5] font-semibold">30-day grace period</strong>,
              you can recover your library anytime by signing back in within 30 days. After that period,
              all stored resources, projects, and collections will be wiped forever.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="xs"
            pill
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
