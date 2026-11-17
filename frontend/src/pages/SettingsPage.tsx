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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage your account profile, theme preferences, and security sessions.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-5 rounded-md bg-[#121316] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center border border-white/10">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[#EDEDED]">
              Profile
            </h2>
            <p className="text-xs text-neutral-400">
              Your personal account credentials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md bg-[#0E0F10] border border-white/[0.08]">
            <span className="text-[11px] text-neutral-500 block mb-1">
              Full Name
            </span>
            <span className="font-medium text-[#EDEDED]">
              {user?.name || 'User'}
            </span>
          </div>

          <div className="p-3 rounded-md bg-[#0E0F10] border border-white/[0.08]">
            <span className="text-[11px] text-neutral-500 block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#EDEDED] truncate">
                {user?.email}
              </span>
              <span className="shrink-0 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 pt-2 border-t border-white/[0.06] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
        </div>
      </div>

      {/* Appearance Card */}
      <div className="p-5 rounded-md bg-[#121316] border border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-sm font-medium text-[#EDEDED]">
            Theme
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select your preferred interface color theme.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-xs">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer',
              theme === 'light'
                ? 'border-white/30 bg-white/[0.1] text-white'
                : 'border-white/[0.08] bg-[#0E0F10] hover:bg-white/[0.04] text-neutral-400'
            )}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer',
              theme === 'dark'
                ? 'border-white/30 bg-white/[0.1] text-white'
                : 'border-white/[0.08] bg-[#0E0F10] hover:bg-white/[0.04] text-neutral-400'
            )}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer',
              theme === 'system'
                ? 'border-white/30 bg-white/[0.1] text-white'
                : 'border-white/[0.08] bg-[#0E0F10] hover:bg-white/[0.04] text-neutral-400'
            )}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Security Sessions Card */}
      <div className="p-5 rounded-md bg-[#121316] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-[#EDEDED]">
                Active Sessions
              </h2>
              <p className="text-xs text-neutral-400">
                Devices currently signed in to your account.
              </p>
            </div>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleRevokeAllOtherSessions}
              isLoading={isRevokingAll}
            >
              Sign Out Others
            </Button>
          )}
        </div>

        {isLoadingSessions ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            Loading sessions...
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const isCurrent = session._id === currentSessionId;
              return (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 rounded-md bg-[#0E0F10] border border-white/[0.06] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-neutral-400">
                      {/mobile|android|iphone|ipad/i.test(session.userAgent || '') ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#EDEDED]">
                          {session.userAgent || 'Web Browser'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            (This device)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {session.ipAddress} • Last active {formatRelativeTime(session.lastActiveAt)}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-rose-400 hover:text-rose-300"
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

      {/* Danger Zone */}
      <div className="p-5 rounded-md bg-[#121316] border border-rose-500/20 space-y-3">
        <div>
          <h2 className="text-sm font-medium text-rose-400">
            Danger Zone
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Permanently delete your account and all associated resources, collections, and projects.
          </p>
        </div>

        <Button
          variant="danger"
          size="xs"
          onClick={() => setIsDeleteAccountOpen(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Account
        </Button>
      </div>

      {/* Delete Account Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteAccountOpen}
        title="Delete Your Account?"
        message="This will permanently delete your account, saved resources, collections, and projects. This cannot be undone."
        confirmText="Delete Account"
        isPermanent
        isLoading={isDeletingAccount}
        onCancel={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default SettingsPage;