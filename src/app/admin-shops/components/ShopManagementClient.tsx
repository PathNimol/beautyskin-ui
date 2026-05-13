'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import StaffManagementModal from '@/components/StaffManagementModal';
import { useRealtimeShops } from '@/hooks/useRealtimeData';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
type ShopStatus = 'active' | 'pending' | 'suspended';

const STATUS_COLORS: Record<ShopStatus, string> = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<ShopStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
};

export default function ShopManagementClient() {
  const { shops, loading, refetch } = useRealtimeShops();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showAddShop, setShowAddShop] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ShopStatus | 'all'>('all');
  const [newShop, setNewShop] = useState({ name: '', owner_name: '', description: '', category: '' });
  const [addingShop, setAddingShop] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const filteredShops = filterStatus === 'all' ? shops : shops.filter(s => s.shop_status === filterStatus);
  const selectedShop = shops.find(s => s.id === selectedShopId) || null;

  const totalStats = {
    shops: shops.length,
    active: shops.filter(s => s.shop_status === 'active').length,
    revenue: shops.reduce((sum, s) => sum + Number(s.revenue), 0),
  };

  const handleAddShop = async () => {
    if (!newShop.name || !newShop.owner_name) return;
    setAddingShop(true);
    const supabase = createClient();
    const slug = newShop.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await supabase.from('shops').insert({
      name: newShop.name,
      slug: `${slug}-${Date.now()}`,
      owner_name: newShop.owner_name,
      description: newShop.description,
      category: newShop.category,
      shop_status: 'pending',
      plan: 'starter',
      logo: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6599022-1772541113609.png',
      logo_alt: `${newShop.name} shop logo`,
    });
    setAddingShop(false);
    if (error) { showToast('Failed to register shop: ' + error.message); return; }
    showToast(`${newShop.name} registered successfully.`);
    setNewShop({ name: '', owner_name: '', description: '', category: '' });
    setShowAddShop(false);
    refetch();
  };

  const updateShopStatus = async (shopId: string, status: ShopStatus) => {
    const supabase = createClient();
    await supabase.from('shops').update({ shop_status: status }).eq('id', shopId);
    refetch();
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-admin-bg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pl-10 md:pl-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Shop Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage registered shops, owners, and their staff</p>
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
          <button onClick={() => setToast(null)} className="ml-auto text-green-500 hover:text-green-700"><Icon name="XMarkIcon" size={16} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Shops', value: totalStats.shops, icon: 'BuildingStorefrontIcon', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Shops', value: totalStats.active, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600' },
          { label: 'Platform Revenue', value: `$${(totalStats.revenue / 1000).toFixed(1)}K`, icon: 'CurrencyDollarIcon', color: 'bg-primary/20 text-rose-deep' },
        ].map(kpi => (
          <div key={kpi.label} className="admin-glass rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <Icon name={kpi.icon as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Shops List */}
        <div className="xl:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-sm">Registered Shops</h2>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as ShopStatus | 'all')}
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
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="py-12 text-center">
                  <Icon name="BuildingStorefrontIcon" size={32} className="text-border mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No shops found</p>
                </div>
              ) : (
                filteredShops.map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`w-full text-left px-5 py-4 hover:bg-secondary/40 transition-all ${selectedShopId === shop.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary shrink-0">
                        <AppImage src={shop.logo} alt={shop.logo_alt} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-foreground truncate">{shop.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${STATUS_COLORS[shop.shop_status]}`}>
                            {STATUS_LABELS[shop.shop_status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{shop.owner_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground">{shop.orders_count} orders</span>
                          <span className="text-[10px] text-muted-foreground">${Number(shop.revenue).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Shop Detail Panel */}
        <div className="xl:col-span-2">
          {selectedShop ? (
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              {/* Shop header */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-secondary shrink-0">
                      <AppImage src={selectedShop.logo} alt={selectedShop.logo_alt} width={56} height={56} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground text-lg">{selectedShop.name}</h2>
                      <p className="text-xs text-muted-foreground">{selectedShop.category}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_COLORS[selectedShop.shop_status]}`}>
                          {STATUS_LABELS[selectedShop.shop_status]}
                        </span>
                        <span className="text-xs text-muted-foreground">{selectedShop.owner_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {(['active', 'pending', 'suspended'] as ShopStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateShopStatus(selectedShop.id, s)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all capitalize ${
                          selectedShop.shop_status === s
                            ? STATUS_COLORS[s] + 'border border-current' :'bg-secondary text-muted-foreground hover:bg-border'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Revenue', value: `$${Number(selectedShop.revenue).toLocaleString()}` },
                    { label: 'Orders', value: selectedShop.orders_count },
                    { label: 'Products', value: selectedShop.products_count },
                  ].map(stat => (
                    <div key={stat.label} className="bg-secondary/40 rounded-xl p-3 text-center">
                      <p className="text-base font-extrabold text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff section */}
              <div className="px-6 py-5 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon name="UserGroupIcon" size={28} className="text-rose-deep" />
                </div>
                <div>
                  <p className="font-bold text-foreground mb-1">Manage Staff for {selectedShop.name}</p>
                  <p className="text-sm text-muted-foreground">Add individual members or bulk import via CSV/Excel with role assignment</p>
                </div>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                >
                  <Icon name="UserGroupIcon" size={16} />
                  Open Staff Management
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl shadow-card flex flex-col items-center justify-center py-24 text-center">
              <Icon name="BuildingStorefrontIcon" size={40} className="text-border mb-4" />
              <p className="text-base font-bold text-foreground mb-1">Select a shop</p>
              <p className="text-sm text-muted-foreground">Click a shop from the list to view details and manage staff</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Shop Modal */}
      {showAddShop && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowAddShop(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-bold text-foreground">Register New Shop</h2>
              <button onClick={() => setShowAddShop(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Shop Name', key: 'name', placeholder: 'e.g. Glow Beauty Store' },
                { label: 'Owner Name', key: 'owner_name', placeholder: 'Full name' },
                { label: 'Description', key: 'description', placeholder: 'Brief shop description' },
                { label: 'Category', key: 'category', placeholder: 'e.g. Serums & Moisturizers' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={newShop[field.key as keyof typeof newShop]}
                    onChange={e => setNewShop(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddShop(false)} className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all">Cancel</button>
                <button
                  onClick={handleAddShop}
                  disabled={addingShop}
                  className="flex-1 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50"
                >
                  {addingShop ? 'Registering…' : 'Register Shop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Modal */}
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