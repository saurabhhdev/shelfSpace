import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { Session } from '../types';
import { Button } from '../components/ui/Button';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Trash2,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

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
      notify('Session revoked', 'success');
      if (sessionId === currentSessionId) {
        await logout();
        navigate('/login');
      } else {
        fetchSessions();
      }
    } catch (err) {
      notify('Failed to revoke session', 'error');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      await apiClient.delete('/auth/sessions');
      notify('All other sessions revoked', 'success');
      fetchSessions();
    } catch (err) {
      notify('Failed to revoke sessions', 'error');
    } finally {
      setIsRevokingAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiClient.delete('/auth/account');
      notify('Account deleted', 'success');
      await logout();
      navigate('/login');
    } catch (err) {
      notify('Failed to delete account', 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
          Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your profile information and active account sessions.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[#EDEDED]">
          <UserIcon className="w-4 h-4 text-neutral-400" />
          <span>Profile Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <span className="text-neutral-500 block mb-1">Full Name</span>
            <span className="font-medium text-[#EDEDED] text-sm block">
              {user?.name || 'Developer'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block mb-1">Email Address</span>
            <span className="font-medium text-[#EDEDED] text-sm font-mono block">
              {user?.email || '—'}
            </span>
          </div>

          <div>
            <span className="text-neutral-500 block mb-1">Member Since</span>
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>{user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Account Sessions & Security */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#EDEDED]">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Active Sessions</span>
          </div>

          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleRevokeAllOtherSessions}
              isLoading={isRevokingAll}
            >
              Sign out other devices
            </Button>
          )}
        </div>

        <p className="text-xs text-neutral-400">
          Devices and browsers that have active access to your Shelfspace account.
        </p>

        {isLoadingSessions ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-md bg-[#0E0F10] animate-pulse border border-white/[0.06]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const isCurrent = session._id === currentSessionId;
              const isMobile = /mobile|android|iphone|ipad/i.test(session.userAgent || '');

              return (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 rounded-md bg-[#0E0F10] border border-white/[0.06] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-neutral-400">
                      {isMobile ? (
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
                          <span className="text-[10px] text-[#09AE5B] font-medium bg-[#09AE5B]/10 px-1.5 py-0.2 rounded border border-[#09AE5B]/20">
                            Current device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {session.ipAddress} • Last active {formatRelativeTime(session.lastActiveAt)}
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleRevokeSession(session._id)}
                      className="text-neutral-400 hover:text-rose-400"
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

      {/* 3. Delete Account */}
      <div className="bg-[#121316] border border-rose-950/40 rounded-md p-5 space-y-3">
        <div className="text-sm font-medium text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </div>
        <p className="text-xs text-neutral-400">
          Permanently delete your account, bookmarks, and categories. This action cannot be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteAccountOpen(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Delete Account Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteAccountOpen}
        title="Delete Your Account?"
        message="Are you sure you want to delete your Shelfspace account? All your resources and categories will be permanently removed."
        confirmText="Permanently Delete Account"
        onCancel={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </div>
  );
};

export default SettingsPage;
