'use client';
// src/app/customers/CustomersClient.tsx
// Fixed imports: @/types/userManagement, @/components/UserFormModal, etc.

import React, { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  STATUS_STYLES,
  type ManagedUser,
  type UserStatus,
} from '@/types/userManagement';
import { customersApi } from '@/lib/api';
import UserFormModal from '@/components/UserFormModel';
import ActivityDrawer from '@/components/ActivityDrawer';
import ConfirmModal from '@/components/ConfirmModel';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl max-w-sm ${
        type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <Icon
        name={type === 'success' ? 'CheckCircleIcon' : 'ExclamationCircleIcon'}
        size={18}
        className={type === 'success' ? 'text-green-600' : 'text-red-500'}
      />
      <p
        className={`text-sm font-semibold flex-1 ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}
      >
        {msg}
      </p>
      <button onClick={onClose}>
        <Icon
          name="XMarkIcon"
          size={15}
          className={type === 'success' ? 'text-green-500' : 'text-red-400'}
        />
      </button>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({
  user,
  onClose,
  onDone,
}: {
  user: ManagedUser;
  onClose: () => void;
  onDone: () => void;
}) {
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (newPw.length < 6) {
      setError('Min 6 characters');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onDone();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <Icon name="KeyIcon" size={22} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-extrabold text-foreground text-center mb-1">Reset Password</h3>
        <p className="text-xs text-muted-foreground text-center mb-5">
          Set a new password for{' '}
          <span className="font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </span>
        </p>
        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
        <div className="space-y-3 mb-5">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2.5 pr-10 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPw ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
            </button>
          </div>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function mapApiCustomer(u: { id: string; email: string; fullName?: string; name?: string; firstName?: string; lastName?: string; role?: string; phone?: string; joinDate?: string }): ManagedUser {
  const first = u.firstName || (u.fullName || u.name || '').split(' ')[0] || '';
  const last = u.lastName || (u.fullName || u.name || '').split(' ').slice(1).join(' ') || '';
  return {
    id: u.id,
    firstName: first,
    lastName: last,
    email: u.email,
    phone: u.phone || '',
    role: 'customer',
    status: 'active',
    joinDate: u.joinDate || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    orders: 0,
    totalSpent: 0,
  };
}

export default function CustomersClient() {
  const [users, setUsers] = useState<ManagedUser[]>([]);

  useEffect(() => {
    customersApi.listCustomers({ limit: 200 })
      .then((page) => setUsers((page.content || []).map(mapApiCustomer)))
      .catch(() => setUsers([]));
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null);
  const [activityUser, setActivityUser] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = useMemo(
    () =>
      users.filter((u: ManagedUser) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [users, search, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u: ManagedUser) => u.status === 'active').length,
      inactive: users.filter((u: ManagedUser) => u.status === 'inactive').length,
      suspended: users.filter((u: ManagedUser) => u.status === 'suspended').length,
    }),
    [users]
  );

  const handleSave = (data: Partial<ManagedUser>) => {
    if (formMode === 'create') {
      const newUser: ManagedUser = {
        id: `c${Date.now()}`,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        phone: data.phone,
        role: 'Customer',
        status: data.status ?? 'active',
        joinedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        lastActive: '—',
        activityLog: [
          { action: 'Account created by admin', timestamp: new Date().toLocaleString() },
        ],
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`${newUser.firstName} ${newUser.lastName} created successfully.`);
    } else if (editTarget) {
      setUsers((prev) =>
        prev.map((u: ManagedUser) =>
          u.id === editTarget.id
            ? {
                ...u,
                ...data,
                activityLog: [
                  { action: 'Profile updated by admin', timestamp: new Date().toLocaleString() },
                  ...u.activityLog,
                ],
              }
            : u
        )
      );
      showToast('User updated successfully.');
    }
    setFormMode(null);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u: ManagedUser) => u.id !== deleteTarget.id));
    showToast(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted.`);
    setDeleteTarget(null);
    if (activityUser?.id === deleteTarget.id) setActivityUser(null);
  };

  const toggleStatus = (userId: string, status: UserStatus) => {
    setUsers((prev) =>
      prev.map((u: ManagedUser) =>
        u.id === userId
          ? {
              ...u,
              status,
              activityLog: [
                { action: `Status changed to ${status}`, timestamp: new Date().toLocaleString() },
                ...u.activityLog,
              ],
            }
          : u
      )
    );
    showToast(`Status updated to ${status}.`);
  };

  const handleResetDone = () => {
    if (!resetTarget) return;
    setUsers((prev) =>
      prev.map((u: ManagedUser) =>
        u.id === resetTarget.id
          ? {
              ...u,
              activityLog: [
                { action: 'Password reset by admin', timestamp: new Date().toLocaleString() },
                ...u.activityLog,
              ],
            }
          : u
      )
    );
    showToast('Password reset successfully.');
    setResetTarget(null);
    setActivityUser(null);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All registered customers across the platform
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(null);
            setFormMode('create');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
        >
          <Icon name="UserPlusIcon" size={16} />
          <span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total',
            value: stats.total,
            icon: 'UsersIcon',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Active',
            value: stats.active,
            icon: 'CheckCircleIcon',
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Inactive',
            value: stats.inactive,
            icon: 'PauseCircleIcon',
            color: 'bg-secondary text-muted-foreground',
          },
          {
            label: 'Suspended',
            value: stats.suspended,
            icon: 'NoSymbolIcon',
            color: 'bg-red-50 text-red-600',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="admin-glass rounded-2xl p-4 shadow-card">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}
            >
              <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {kpi.label} Customers
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {(['all', 'active', 'inactive', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-primary text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Customer
                </th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  Last Active
                </th>
                <th className="text-center px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-muted-foreground">
                    <Icon name="UsersIcon" size={32} className="mx-auto text-border mb-3" />
                    No customers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user: ManagedUser) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-extrabold text-rose-deep">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{user.joinedAt}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={user.status}
                        onChange={(e) => toggleStatus(user.id, e.target.value as UserStatus)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all ${STATUS_STYLES[user.status]}`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActivityUser(user)}
                          title="View activity"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
                        >
                          <Icon name="ClockIcon" size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditTarget(user);
                            setFormMode('edit');
                          }}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
                        >
                          <Icon name="PencilSquareIcon" size={15} />
                        </button>
                        <button
                          onClick={() => setResetTarget(user)}
                          title="Reset password"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-all text-muted-foreground hover:text-blue-600"
                        >
                          <Icon name="KeyIcon" size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all text-muted-foreground hover:text-red-500"
                        >
                          <Icon name="TrashIcon" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
            <span className="font-semibold text-foreground">{users.length}</span> customers
          </p>
        </div>
      </div>

      {/* Modals */}
      {formMode && (
        <UserFormModal
          mode={formMode}
          user={editTarget}
          lockedRole="Customer"
          onSave={handleSave}
          onClose={() => {
            setFormMode(null);
            setEditTarget(null);
          }}
        />
      )}
      {activityUser && (
        <ActivityDrawer
          user={activityUser}
          onClose={() => setActivityUser(null)}
          onResetPassword={(u: ManagedUser) => {
            setActivityUser(null);
            setResetTarget(u);
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          variant="danger"
          title="Delete Customer"
          message={`Are you sure you want to permanently delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This cannot be undone.`}
          confirmLabel="Delete Customer"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onDone={handleResetDone}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
