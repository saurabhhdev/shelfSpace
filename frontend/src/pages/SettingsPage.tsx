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
      <div className="p-5 sm:p-6 rounded-none bg-[#121316] border border-white/10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#0E0F10] text-[#09AE5B] flex items-center justify-center border border-white/10">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#E5E5E5]">
              Profile Details
            </h2>
            <p className="text-xs text-neutral-400">
              Primary credentials for your Shelfspace account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-none bg-[#0E0F10] border border-white/10">
            <span className="text-[11px] font-medium text-neutral-400 block mb-1">
              Full Name
            </span>
            <span className="font-semibold text-[#E5E5E5] text-sm">
              {user?.name || 'Shelfspace User'}
            </span>
          </div>

          <div className="p-3.5 rounded-none bg-[#0E0F10] border border-white/10">
            <span className="text-[11px] font-medium text-neutral-400 block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#E5E5E5] text-sm truncate">
                {user?.email}
              </span>
              <span className="shrink-0 text-[10px] font-medium font-mono px-2 py-0.5 rounded-none bg-[#141519] text-[#09AE5B] border border-[#09AE5B]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#09AE5B]" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 pt-3 border-t border-white/[0.08] flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#09AE5B]" />
          <span>Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="p-5 sm:p-6 rounded-none bg-[#121316] border border-white/10 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#E5E5E5]">
            Interface Appearance
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose light workspace, deep dark mode, or system default.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-none border text-xs font-medium transition-all cursor-pointer',
              theme === 'light'
                ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
            )}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-none border text-xs font-medium transition-all cursor-pointer',
              theme === 'dark'
                ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
            )}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-none border text-xs font-medium transition-all cursor-pointer',
              theme === 'system'
                ? 'border-[#09AE5B] bg-[#09AE5B] text-black font-semibold'
                : 'border-white/10 bg-[#0E0F10] hover:border-[#09AE5B]/60 text-neutral-400'
            )}
          >
            <Laptop className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="p-5 sm:p-6 rounded-none bg-[#121316] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#0E0F10] text-[#09AE5B] flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#E5E5E5]">
                Active Device Sessions
              </h2>
              <p className="text-xs text-neutral-400">
                Authenticated browsers and devices holding access to your library.
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
              Revoke Other Devices
            </Button>
          )}
        </div>

        {isLoadingSessions ? (
          <div className="py-6 text-center text-xs text-neutral-400 font-mono">
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
                  className="flex items-center justify-between p-3.5 rounded-none border border-white/10 bg-[#0E0F10] text-xs transition-colors hover:border-[#09AE5B]/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-none bg-[#141519] border border-white/10 flex items-center justify-center text-[#E5E5E5]">
                      {isMobile ? <Smartphone className="w-4 h-4 text-[#09AE5B]" /> : <Laptop className="w-4 h-4 text-[#09AE5B]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-medium text-[#E5E5E5]">
                        <span className="truncate max-w-xs text-xs font-mono">{sess.userAgent}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-[#141519] text-[#09AE5B] font-semibold border border-[#09AE5B]/30">
                            Current Device
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5 font-mono">
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
                      className="text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-mono"
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
      <div className="p-5 sm:p-6 rounded-none bg-rose-950/15 border border-rose-900/40 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-none bg-rose-950/40 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[#E5E5E5]">
              Danger Zone: Account Deletion
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Deleting your account terminates all active sessions immediately. With the built-in{' '}
              <strong className="text-[#E5E5E5] font-semibold">30-day grace period</strong>,
              you can recover your library anytime by signing back in within 30 days. After that period,
              all stored resources, projects, and collections will be wiped forever.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="xs"
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

