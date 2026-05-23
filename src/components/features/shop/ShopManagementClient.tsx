'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import StaffManagementModal from '@/components/StaffManagementModal';
import AddShopModal from './AddShopModal';
import { broadcastNotificationsRefresh, useRealtimeShops } from '@/hooks/useRealtimeData';
import { shopsApi } from '@/lib/api';
import { STATUS_COLORS, STATUS_LABELS, type ShopStatus, type NewShopForm } from './shop-types';
import { useMockAuth } from '@/contexts/MockAuthContext';

export default function ShopManagementClient() {
  const { shops, loading, refetch } = useRealtimeShops();
  const { role } = useMockAuth();
  const isAdmin = role === 'admin';

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [showAddShop, setShowAddShop] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ShopStatus | 'all'>('all');
  const [addingShop, setAddingShop] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const filteredShops =
    filterStatus === 'all' ? shops : shops.filter((s) => s.shop_status === filterStatus);
  const selectedShop = shops.find((s) => s.id === selectedShopId) || null;

  const totalStats = {
    shops: shops.length,
    active: shops.filter((s) => s.shop_status === 'active').length,
    revenue: shops.reduce((sum, s) => sum + Number(s.revenue), 0),
  };

  const handleAddShop = async (form: NewShopForm) => {
    setAddingShop(true);
    const slug = form.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    try {
      await shopsApi.createShop({
        name: form.name,
        slug: `${slug}-${Date.now()}`,
        ownerName: form.owner_name,
        description: form.description,
        category: form.category,
        logo: form.logo || undefined,
        status: 'PENDING',
        plan: 'STARTER',
      });
      showToast(`${form.name} registered successfully.`);
      setShowAddShop(false);
      refetch();
      broadcastNotificationsRefresh();
    } catch (e) {
      showToast('Failed to register shop: ' + (e instanceof Error ? e.message : 'Error'));
    } finally {
      setAddingShop(false);
    }
  };

  const updateShopStatus = async (shopId: string, status: ShopStatus) => {
    try {
      await shopsApi.updateShopStatus(shopId, status.toUpperCase());
      const shop = shops.find((s) => s.id === shopId);
      const label =
        status === 'active' ? 'approved' : status === 'suspended' ? 'rejected' : `set to ${status}`;
      showToast(`"${shop?.name}" has been ${label}.`);
      refetch();
      broadcastNotificationsRefresh();
    } catch (e) {
      showToast('Failed to update status: ' + (e instanceof Error ? e.message : 'Error'));
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Shop Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage registered shops, owners, and their staff
          </p>
        </div>
        <button
          onClick={() => setShowAddShop(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
        >
          <Icon name="PlusIcon" size={16} />
          <span className="hidden sm:inline">Register Shop</span>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
          <Icon name="CheckCircleIcon" size={18} className="text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700">{toast}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total Shops',
            value: totalStats.shops,
            icon: 'BuildingStorefrontIcon',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Active Shops',
            value: totalStats.active,
            icon: 'CheckCircleIcon',
            color: 'bg-green-50 text-green-600',
          },
          {
            label: 'Platform Revenue',
            value: `$${(totalStats.revenue / 1000).toFixed(1)}K`,
            icon: 'CurrencyDollarIcon',
            color: 'bg-primary/20 text-rose-deep',
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

      {/* Pending Approvals Banner — admin only */}
      {isAdmin && shops.filter((s) => s.shop_status === 'pending').length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <Icon name="ClockIcon" size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-700">
              Pending Approvals ({shops.filter((s) => s.shop_status === 'pending').length})
            </p>
          </div>
          <div className="divide-y divide-amber-100">
            {shops
              .filter((s) => s.shop_status === 'pending')
              .map((shop) => (
                <div key={shop.id} className="flex items-center gap-3 px-5 py-3 flex-wrap">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-amber-100 shrink-0 flex items-center justify-center">
                    {shop.logo ? (
                      <AppImage
                        src={shop.logo}
                        alt={shop.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Icon name="BuildingStorefrontIcon" size={14} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{shop.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Owner: {shop.owner_name}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateShopStatus(shop.id, 'active')}
                      className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateShopStatus(shop.id, 'suspended')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Shops List */}
        <div className="xl:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-sm">Registered Shops</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ShopStatus | 'all')}
                className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
              ) : filteredShops.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No shops found
                </div>
              ) : (
                filteredShops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary transition-all text-left ${
                      selectedShopId === shop.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                      {shop.logo ? (
                        <AppImage
                          src={shop.logo}
                          alt={shop.name}
                          width={36}
                          height={36}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Icon name="BuildingStorefrontIcon" size={16} className="text-rose-deep" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{shop.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{shop.owner_name}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[shop.shop_status]}`}
                    >
                      {STATUS_LABELS[shop.shop_status]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Shop Detail */}
        <div className="xl:col-span-2">
          {selectedShop ? (
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                    {selectedShop.logo ? (
                      <AppImage
                        src={selectedShop.logo}
                        alt={selectedShop.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Icon name="BuildingStorefrontIcon" size={24} className="text-rose-deep" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-lg leading-tight">
                      {selectedShop.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedShop.shop_status]}`}
                      >
                        {STATUS_LABELS[selectedShop.shop_status]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedShop.owner_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {isAdmin ? (
                    (['active', 'pending', 'suspended'] as ShopStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateShopStatus(selectedShop.id, s)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all capitalize ${
                          selectedShop.shop_status === s
                            ? STATUS_COLORS[s] + ' border border-current'
                            : 'bg-secondary text-muted-foreground hover:bg-border'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[selectedShop.shop_status]}`}
                    >
                      {selectedShop.shop_status === 'pending'
                        ? '⏳ Awaiting Approval'
                        : STATUS_LABELS[selectedShop.shop_status]}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-6 mt-4">
                {[
                  { label: 'Revenue', value: `$${Number(selectedShop.revenue).toLocaleString()}` },
                  { label: 'Orders', value: selectedShop.orders_count },
                  { label: 'Products', value: selectedShop.products_count },
                ].map((stat) => (
                  <div key={stat.label} className="bg-secondary/40 rounded-xl p-3 text-center">
                    <p className="text-base font-extrabold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-8 flex flex-col items-center justify-center gap-4 text-center border-t border-border/60 mt-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon name="UserGroupIcon" size={30} className="text-rose-deep" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">
                    Owners & Staff — {selectedShop.name}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Open the full user screen, use quick filters, manage catalog products, or open
                    the staff CSV modal.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch justify-center gap-3 w-full max-w-2xl">
                  <Link
                    href={`/admin/shops/${selectedShop.id}/products`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-secondary transition-all"
                  >
                    <Icon name="ArchiveBoxIcon" size={16} />
                    Product catalog
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                  >
                    <Icon name="UserGroupIcon" size={16} />
                    Staff modal
                  </button>
                  <Link
                    href={`/admin/shops/${selectedShop.id}/users`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-border transition-all text-sm"
                  >
                    <Icon name="UserGroupIcon" size={16} />
                    Manage users
                  </Link>
                  <Link
                    href={`/admin/shops/${selectedShop.id}/users?role=Owner`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-border transition-all text-sm"
                  >
                    <Icon name="BuildingStorefrontIcon" size={16} />
                    Owners
                  </Link>
                  <Link
                    href={`/admin/shops/${selectedShop.id}/users?role=Staff`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-border transition-all text-sm"
                  >
                    <Icon name="UserIcon" size={16} />
                    Staff
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl shadow-card flex flex-col items-center justify-center py-24 text-center">
              <Icon name="BuildingStorefrontIcon" size={40} className="text-border mb-4" />
              <p className="text-base font-bold text-foreground mb-1">Select a shop</p>
              <p className="text-sm text-muted-foreground">
                Click a shop from the list to view details and manage users
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Shop Modal */}
      {showAddShop && (
        <AddShopModal
          onClose={() => setShowAddShop(false)}
          onSuccess={handleAddShop}
          adding={addingShop}
        />
      )}

      {showStaffModal && selectedShop && (
        <StaffManagementModal
          shopId={selectedShop.id}
          shopName={selectedShop.name}
          onClose={() => setShowStaffModal(false)}
        />
      )}
    </div>
  );
}
