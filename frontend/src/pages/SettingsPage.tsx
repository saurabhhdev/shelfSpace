import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { Session } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Trash2,
  KeyRound,
  Check,
  X,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.name]);

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

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.trim().length < 2) {
      notify('Name must be at least 2 characters', 'error');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      await apiClient.patch('/auth/me', { name: profileName.trim() });
      notify('Profile name updated', 'success');
      await refetchUser();
      setIsEditingProfile(false);
    } catch (err: any) {
      notify(err.response?.data?.message || 'Failed to update name', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.patch('/auth/me', { currentPassword, newPassword });
      notify('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
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
          Manage your profile information, password, and active account sessions.
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-[#1C1C1B] border border-[#3E3E38] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#FAF9F5]">
            <UserIcon className="w-4 h-4 text-neutral-400" />
            <span>Profile Information</span>
          </div>
          {!isEditingProfile && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Name
            </Button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleUpdateName} className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Full Name</label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your full name"
                required
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="xs" isLoading={isUpdatingProfile} leftIcon={<Check className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setProfileName(user?.name || '');
                  setIsEditingProfile(false);
                }}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-neutral-500 block mb-1">Full Name</span>
              <span className="font-medium text-[#FAF9F5] text-sm block">
                {user?.name || 'Developer'}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block mb-1">Email Address</span>
              <span className="font-medium text-[#FAF9F5] text-sm font-mono block">
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
        )}
      </div>

      {/* 2. Security & Password */}
      <div className="bg-[#1C1C1B] border border-[#3E3E38] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#FAF9F5]">
            <KeyRound className="w-4 h-4 text-neutral-400" />
            <span>Password & Security</span>
          </div>
          {!isChangingPassword && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setIsChangingPassword(true);
                setPasswordError('');
              }}
            >
              Change Password
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-3 pt-1 max-w-md">
            {passwordError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {passwordError}
              </div>
            )}
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">New Password (min 8 chars)</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                required
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="xs" isLoading={isUpdatingPassword} leftIcon={<Check className="w-3.5 h-3.5" />}>
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setIsChangingPassword(false);
                }}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-neutral-400">
            Ensure your account is using a long, random password to stay secure.
          </p>
        )}
      </div>

      {/* 2. Account Sessions & Security */}
      <div className="bg-[#1C1C1B] border border-[#3E3E38] rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#FAF9F5]">
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
                className="h-14 rounded-md bg-[#262624] animate-pulse border border-[#3E3E38]"
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
                  className="flex items-center justify-between p-3 rounded-md bg-[#262624] border border-[#3E3E38] text-xs"
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
                        <span className="font-medium text-[#FAF9F5]">
                          {session.userAgent || 'Web Browser'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-[#D97757] font-medium bg-[#D97757]/10 px-1.5 py-0.2 rounded border border-[#D97757]/20">
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
      <div className="bg-[#1C1C1B] border border-rose-950/40 rounded-md p-5 space-y-3">
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
