import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../api/client';
import { Session } from '../types';
import { Button } from '../components/ui/Button';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatRelativeTime, cn } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Revoke modal
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Preferences
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
          Settings & Security
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account profile, theme appearance, and active login sessions.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-zinc-400" />
          Account Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-zinc-400 block mb-1">Full Name</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {user?.name}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-zinc-400 block mb-1">Email Address</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                {user?.email}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
        </div>
      </div>

      {/* Appearance Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Appearance Theme</h2>
        <p className="text-xs text-zinc-500">
          Choose your interface theme or sync automatically with your system preference.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            )}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            )}
          >
            <Moon className="w-5 h-5 text-blue-400" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all',
              theme === 'system'
                ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            )}
          >
            <Laptop className="w-5 h-5 text-zinc-400" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Active Sessions Card (Phase 6 requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Active Login Sessions
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Devices and browsers that currently hold authenticated access to your library.
            </p>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleRevokeAllOtherSessions}
              isLoading={isRevokingAll}
            >
              Revoke All Other Sessions
            </Button>
          )}
        </div>

        {isLoadingSessions ? (
          <div className="py-8 text-center text-xs text-zinc-400">Loading active sessions...</div>
        ) : (
          <div className="space-y-2">
            {sessions.map((sess) => {
              const isCurrent = sess._id === currentSessionId;
              const isMobile = /mobile|android|iphone/i.test(sess.userAgent);

              return (
                <div
                  key={sess._id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300">
                      {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="truncate max-w-xs">{sess.userAgent}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-300 dark:border-emerald-800">
                            Current Device
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>IP: {sess.ipAddress}</span>
                        <span>•</span>
                        <span>Last active: {formatRelativeTime(sess.lastActiveAt)}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleRevokeSession(sess._id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
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

      {/* Danger Zone: Account Deletion with 30-day Grace Period */}
      <div className="p-6 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Deleting your account deactivates all active sessions. In accordance with the 30-day grace
            period, you can reactivate your account by logging back in within 30 days. After 30 days,
            all resources, collections, and projects will be permanently purged.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteAccountOpen(true)}
        >
          Request Account Deletion
        </Button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteAccountOpen}
        title="Schedule Account Deletion?"
        message="Your account will enter a 30-day grace period. If you do not log in within 30 days, all your data will be permanently wiped."
        confirmText="Schedule Deletion"
        isPermanent
        isLoading={isDeletingAccount}
        onCancel={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};
