'use client';
// src/components/features/shop/ShopUsersClient.tsx — per-shop user management (admin).

import React, { useState, useMemo, useEffect } from 'react';
import { shopStaffApi, shopsApi } from '@/lib/api';
import { mapAccountStatusFromApi, mapAccountStatusToApi } from '@/lib/api/mappers';
import { useRealtimeStaff } from '@/hooks/useRealtimeData';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import {
  STATUS_STYLES,
  ROLE_STYLES,
  type ManagedUser,
  type UserRole,
  type UserStatus,
} from '@/types/userManagement';
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
function ResetPasswordModal({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setErr('Password reset for shop staff is not available via API yet.');
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
          For{' '}
          <span className="font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </span>
        </p>
        {err && <p className="text-xs text-red-500 text-center mb-3">{err}</p>}
        <div className="space-y-3 mb-5">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
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

// ─── Role tabs ────────────────────────────────────────────────────────────────
const SHOP_ROLES: Array<UserRole | 'all'> = ['all', 'Owner', 'Staff'];

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props {
  shopId: string;
}

function mapStaffRole(role: string): UserRole {
  const r = role.toUpperCase();
  if (r === 'OWNER') return 'Owner';
  return 'Staff';
}

function mapStaffRoleToApi(role: UserRole): string {
  return role === 'Owner' ? 'OWNER' : 'STAFF';
}

export default function ShopUsersClient({ shopId }: Props) {
  const [shop, setShop] = useState<{ id: string; name: string; status: string } | null>(null);
  const { staff, refetch, removeStaffMember } = useRealtimeStaff(shopId);

  const allUsers = useMemo(
    () =>
      staff.map((s) => ({
        id: s.id,
        firstName: s.name.split(' ')[0] || s.name,
        lastName: s.name.split(' ').slice(1).join(' '),
        email: s.email,
        phone: s.phone || '',
        role: mapStaffRole(s.role),
        status: mapAccountStatusFromApi(s.status === 'Active' ? 'ACTIVE' : 'INACTIVE'),
        shopId,
        shopName: shop?.name,
        joinedAt: s.created_at
          ? new Date(s.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        lastActive: s.updated_at
          ? new Date(s.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        activityLog: [] as ManagedUser['activityLog'],
      })),
    [staff, shopId, shop?.name]
  );

  useEffect(() => {
    shopsApi
      .getShop(shopId)
      .then((s) => setShop({ id: s.id, name: s.name, status: s.status }))
      .catch(() => {});
  }, [shopId]);

  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<UserRole | 'all'>('all');
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
      allUsers.filter((u: ManagedUser) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q);
        const matchRole = roleTab === 'all' || u.role === roleTab;
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
      }),
    [allUsers, search, roleTab, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: allUsers.length,
      owners: allUsers.filter((u: ManagedUser) => u.role === 'Owner').length,
      staff: allUsers.filter((u: ManagedUser) => u.role === 'Staff').length,
      active: allUsers.filter((u: ManagedUser) => u.status === 'active').length,
    }),
    [allUsers]
  );

  const handleSave = async (data: Partial<ManagedUser>) => {
    const name = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
    try {
      if (formMode === 'create') {
        await shopStaffApi.create(shopId, {
          name,
          email: data.email ?? '',
          phone: data.phone,
          role: mapStaffRoleToApi((data.role as UserRole) ?? 'Staff'),
        });
        await refetch();
        showToast(`${name} added to ${shop?.name}.`);
      } else if (editTarget) {
        await shopStaffApi.update(shopId, editTarget.id, {
          name,
          email: data.email,
          phone: data.phone,
          role: data.role ? mapStaffRoleToApi(data.role as UserRole) : undefined,
          status: data.status ? mapAccountStatusToApi(data.status) : undefined,
        });
        await refetch();
        showToast('User updated successfully.');
      }
      setFormMode(null);
      setEditTarget(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeStaffMember(deleteTarget.id);
    if (ok) {
      showToast(`${deleteTarget.firstName} ${deleteTarget.lastName} removed.`);
      setDeleteTarget(null);
      if (activityUser?.id === deleteTarget.id) setActivityUser(null);
    } else {
      showToast('Failed to remove user', 'error');
    }
  };

  const handleToggleStatus = async (userId: string, status: UserStatus) => {
    try {
      await shopStaffApi.update(shopId, userId, { status: mapAccountStatusToApi(status) });
      await refetch();
      showToast(`Status updated to ${status}.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Status update failed', 'error');
    }
  };

  if (!shop) {
    return (
      <div className="p-6 md:p-8 min-h-screen bg-admin-bg flex flex-col items-center justify-center gap-4">
        <Icon name="BuildingStorefrontIcon" size={48} className="text-border" />
        <h1 className="text-xl font-bold text-foreground">Shop not found</h1>
        <Link
          href="/admin/shops"
          className="flex items-center gap-2 text-sm text-accent hover:text-gold-deep font-semibold transition-colors"
        >
          <Icon name="ArrowLeftIcon" size={15} /> Back to Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 pl-10 md:pl-0">
        <Link href="/admin/shops" className="hover:text-foreground transition-colors">
          Shops
        </Link>
        <Icon name="ChevronRightIcon" size={12} />
        <Link href={`/admin/shops/`} className="text-foreground font-semibold">
          {shop.name}
        </Link>
        <Icon name="ChevronRightIcon" size={12} />
        <span className="text-foreground font-semibold">Users</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {shop.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage owners and staff for this shop
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
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Users',
            value: stats.total,
            icon: 'UsersIcon',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Owners',
            value: stats.owners,
            icon: 'BuildingStorefrontIcon',
            color: 'bg-rose-50 text-rose-600',
          },
          {
            label: 'Staff',
            value: stats.staff,
            icon: 'UserGroupIcon',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Active',
            value: stats.active,
            icon: 'CheckCircleIcon',
            color: 'bg-green-50 text-green-600',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="admin-glass rounded-2xl p-4 shadow-card">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}
            >
              <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Role tabs + search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shrink-0">
          {SHOP_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleTab(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleTab === r
                  ? 'bg-primary text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'all' ? 'All' : r}
              <span className="ml-1.5 text-[10px] opacity-70">
                {r === 'all'
                  ? allUsers.length
                  : allUsers.filter((u: ManagedUser) => u.role === r).length}
              </span>
            </button>
          ))}
        </div>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* User Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl shadow-card flex flex-col items-center justify-center py-24 text-center">
          <Icon name="UserGroupIcon" size={40} className="text-border mb-4" />
          <p className="text-base font-bold text-foreground mb-1">No users found</p>
          <p className="text-sm text-muted-foreground">Try adjusting filters or add a new user</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user: ManagedUser) => (
            <div
              key={user.id}
              className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-rose transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-extrabold text-rose-deep">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${ROLE_STYLES[user.role]}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <select
                  value={user.status}
                  onChange={(e) => handleToggleStatus(user.id, e.target.value as UserStatus)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all ${STATUS_STYLES[user.status]}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {user.phone && (
                  <span className="text-[11px] text-muted-foreground truncate">{user.phone}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-4">
                <span>Joined {user.joinedAt}</span>
                <span>Active {user.lastActive}</span>
              </div>

              <div className="flex items-center gap-1.5 pt-4 border-t border-border">
                <button
                  onClick={() => setActivityUser(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                  <Icon name="ClockIcon" size={14} /> Activity
                </button>
                <button
                  onClick={() => {
                    setEditTarget(user);
                    setFormMode('edit');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                  <Icon name="PencilSquareIcon" size={14} /> Edit
                </button>
                <button
                  onClick={() => setResetTarget(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <Icon name="KeyIcon" size={14} /> Reset Pw
                </button>
                <button
                  onClick={() => setDeleteTarget(user)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Icon name="TrashIcon" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {formMode && (
        <UserFormModal
          mode={formMode}
          user={editTarget}
          shops={shop ? [shop] : []}
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
          title="Remove User"
          message={`Are you sure you want to remove ${deleteTarget.firstName} ${deleteTarget.lastName} from ${shop.name}?`}
          confirmLabel="Remove User"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
