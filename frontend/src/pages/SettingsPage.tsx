import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import {
  User as UserIcon,
  Calendar,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.name]);

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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
          Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your profile information and account settings.
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

      {/* 2. Delete Account */}
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
