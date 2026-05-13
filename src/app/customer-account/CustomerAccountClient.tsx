'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { MOCK_ORDERS, MOCK_REVIEWS, MOCK_SHOPS, MOCK_PRODUCTS } from '@/lib/mock/data';
import { createClient } from '@/lib/supabase/client';
import { DbOrder } from '@/hooks/useRealtimeData';

const ORDER_STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-green-50 text-green-700',
  Shipping: 'bg-blue-50 text-blue-700',
  Packing: 'bg-purple-50 text-purple-700',
  Confirmed: 'bg-cyan-50 text-cyan-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-700',
  Returned: 'bg-gray-100 text-gray-600',
};

const ORDER_STATUS_STEPS = ['Pending', 'Confirmed', 'Packing', 'Shipping', 'Delivered'];

const ORDER_STATUS_ICONS: Record<string, string> = {
  Pending: 'ClockIcon',
  Confirmed: 'CheckCircleIcon',
  Packing: 'ArchiveBoxIcon',
  Shipping: 'TruckIcon',
  Delivered: 'CheckBadgeIcon',
  Cancelled: 'XCircleIcon',
  Returned: 'ArrowUturnLeftIcon',
};

const WISHLIST_ITEMS = [
  { id: 'prod-001', name: 'Snail Mucin 96% Power Repairing Essence', brand: 'COSRX', price: 22.50, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1adc2c648-1764677055508.png', imageAlt: 'COSRX Snail Mucin Essence', inStock: true },
  { id: 'prod-003', name: 'Hydra Barrier Ceramide Cream', brand: 'Laneige', price: 34.00, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10d8377a6-1772074025128.png', imageAlt: 'Laneige ceramide cream', inStock: true },
];

interface TimelineEvent {
  id: string;
  status: string;
  note: string;
  updated_by_name: string;
  created_at: string;
}

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'reviews' | 'shops' | 'feedback';

export default function CustomerAccountClient() {
  const { user } = useMockAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editMode, setEditMode] = useState(false);
  const [wishlist, setWishlist] = useState(WISHLIST_ITEMS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ productId: '', productName: '', shopId: '', rating: 5, title: '', body: '' });
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [myFeedback, setMyFeedback] = useState<{ id: string; product_name: string; rating: number; title: string; body: string; created_at: string }[]>([]);

  // Live orders from Supabase
  const [liveOrders, setLiveOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [orderBadge, setOrderBadge] = useState(0);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Emma Rodriguez',
    email: user?.email || 'buyer@beautyskin.com',
    phone: user?.phone || '+1 555-0005',
    skinType: 'Combination',
    skinConcerns: 'Acne, Hyperpigmentation',
    birthday: '1995-06-15',
  });

  const customerOrders = MOCK_ORDERS.filter(o => o.customerId === 'usr-005').concat(MOCK_ORDERS.slice(0, 2));
  const customerReviews = MOCK_REVIEWS.filter(r => r.customerId === 'usr-005');

  // Fetch live orders from Supabase
  const fetchLiveOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) {
        setLiveOrders(data as DbOrder[]);
        const pending = (data as DbOrder[]).filter(o => o.order_status === 'Pending' || o.order_status === 'Confirmed' || o.order_status === 'Packing' || o.order_status === 'Shipping').length;
        setOrderBadge(pending);
      }
    } catch { /* ignore */ }
    setOrdersLoading(false);
  }, [supabase]);

  // Fetch order timeline
  const fetchTimeline = useCallback(async (orderId: string) => {
    setTimelineLoading(true);
    try {
      const { data } = await supabase
        .from('order_status_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (data) setTimeline(data as TimelineEvent[]);
    } catch { /* ignore */ }
    setTimelineLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLiveOrders();
  }, [fetchLiveOrders]);

  // Real-time subscription for order updates
  useEffect(() => {
    const channel = supabase
      .channel('customer_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setLiveOrders(prev => prev.map(o => o.id === payload.new.id ? (payload.new as DbOrder) : o));
          if (selectedOrder?.id === payload.new.id) {
            setSelectedOrder(payload.new as DbOrder);
            fetchTimeline(payload.new.id);
          }
          const updated = payload.new as DbOrder;
          if (updated.order_status === 'Delivered' || updated.order_status === 'Cancelled') {
            setOrderBadge(prev => Math.max(0, prev - 1));
          }
        }
        if (payload.eventType === 'INSERT') {
          setLiveOrders(prev => [payload.new as DbOrder, ...prev]);
          setOrderBadge(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, selectedOrder, fetchTimeline]);

  // Real-time timeline subscription
  useEffect(() => {
    if (!selectedOrder) return;
    const channel = supabase
      .channel(`timeline_${selectedOrder.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_status_timeline',
        filter: `order_id=eq.${selectedOrder.id}`,
      }, (payload) => {
        setTimeline(prev => [...prev, payload.new as TimelineEvent]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, selectedOrder]);

  const handleSelectOrder = (order: DbOrder) => {
    setSelectedOrder(order);
    fetchTimeline(order.id);
  };

  const fetchMyFeedback = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('customer_feedback')
        .select('id, product_name:product_id, rating, title, body, created_at')
        .eq('customer_id', user?.id || '')
        .order('created_at', { ascending: false });
      if (data) setMyFeedback(data as typeof myFeedback);
    } catch { /* ignore */ }
  }, [supabase, user?.id]);

  useEffect(() => {
    fetchMyFeedback();
  }, [fetchMyFeedback]);

  const handleSaveProfile = () => {
    setSaveSuccess(true);
    setEditMode(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.productName || !feedbackForm.title || !feedbackForm.body) return;
    setFeedbackSaving(true);
    try {
      const { error } = await supabase.from('customer_feedback').insert({
        shop_id: null,
        product_id: null,
        customer_id: user?.id || '',
        customer_name: user?.name || '',
        customer_avatar: user?.avatar || '',
        rating: feedbackForm.rating,
        title: feedbackForm.title,
        body: feedbackForm.body,
        verified: true,
      });
      if (error) throw error;
      setFeedbackSuccess('Feedback submitted successfully!');
      setFeedbackForm({ productId: '', productName: '', shopId: '', rating: 5, title: '', body: '' });
      setTimeout(() => setFeedbackSuccess(''), 4000);
      fetchMyFeedback();
    } catch { /* ignore */ }
    setFeedbackSaving(false);
  };

  const getStatusStep = (status: string) => ORDER_STATUS_STEPS.indexOf(status);

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'profile', label: 'Profile', icon: 'UserIcon' },
    { id: 'orders', label: 'Orders', icon: 'ClipboardDocumentListIcon', badge: orderBadge },
    { id: 'shops', label: 'Browse Shops', icon: 'BuildingStorefrontIcon' },
    { id: 'wishlist', label: 'Wishlist', icon: 'HeartIcon' },
    { id: 'addresses', label: 'Addresses', icon: 'MapPinIcon' },
    { id: 'reviews', label: 'Reviews', icon: 'StarIcon' },
    { id: 'feedback', label: 'Feedback', icon: 'ChatBubbleLeftRightIcon' },
  ];

  return (
    <DashboardLayout title="My Account" subtitle="Manage your profile, orders, and shop browsing">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-card">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30">
                {user?.avatar ? (
                  <AppImage src={user.avatar} alt={user.avatarAlt || 'Profile'} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Icon name="UserIcon" size={32} className="text-rose-deep" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-foreground">{profileData.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{profileData.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-semibold">Verified Customer</span>
                <span className="text-xs text-muted-foreground">Member since Jun 2024</span>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Orders', value: liveOrders.length || customerOrders.length },
                { label: 'Reviews', value: customerReviews.length },
                { label: 'Wishlist', value: wishlist.length },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={tab.icon as Parameters<typeof Icon>[0]['name']} size={15} />
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            {saveSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                <Icon name="CheckCircleIcon" size={18} className="text-green-600" />
                <p className="text-sm text-green-700 font-medium">Profile saved successfully!</p>
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground">Personal Information</h3>
              <button
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  editMode ? 'bg-primary text-foreground shadow-rose hover:bg-rose-deep hover:text-white' : 'bg-secondary border border-border text-muted-foreground hover:bg-border'
                }`}
              >
                <Icon name={editMode ? 'CheckIcon' : 'PencilIcon'} size={14} />
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Skin Type', key: 'skinType', type: 'text' },
                { label: 'Skin Concerns', key: 'skinConcerns', type: 'text' },
                { label: 'Birthday', key: 'birthday', type: 'date' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={profileData[field.key as keyof typeof profileData]}
                    onChange={e => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    disabled={!editMode}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab – Live Order Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Live order tracking</span>
              {ordersLoading && <span className="text-xs text-blue-500 ml-1">Loading...</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order List */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-bold text-foreground">Order History</h3>
                </div>
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {(liveOrders.length > 0 ? liveOrders : customerOrders.map(o => ({
                    id: o.id,
                    order_ref: o.id,
                    customer_name: o.customerName || '',
                    customer_email: '',
                    customer_phone: '',
                    customer_avatar: '',
                    customer_avatar_alt: '',
                    shop_id: null,
                    shop_name: o.shopName || '',
                    items: o.items || [],
                    total: o.total,
                    subtotal: o.total,
                    shipping: 0,
                    discount: 0,
                    order_status: o.status as DbOrder['order_status'],
                    payment_method: o.paymentMethod || '',
                    pay_status: 'Paid' as DbOrder['pay_status'],
                    address: '',
                    city: '',
                    country: '',
                    tracking_number: null,
                    notes: null,
                    created_at: o.createdAt || '',
                    updated_at: o.createdAt || '',
                  } as DbOrder))).map(order => (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`w-full px-5 py-4 hover:bg-secondary/30 transition-all text-left ${selectedOrder?.id === order.id ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <p className="text-sm font-bold text-foreground">{order.order_ref}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLES[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.order_status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{order.shop_name} · {Array.isArray(order.items) ? order.items.length : 0} items</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-extrabold text-rose-deep">${Number(order.total).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.payment_method}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {liveOrders.length === 0 && !ordersLoading && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <Icon name="ClipboardDocumentListIcon" size={32} className="opacity-20 mb-2" />
                      <p className="text-sm">No orders found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {!selectedOrder ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                    <Icon name="ClipboardDocumentListIcon" size={36} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium">Select an order</p>
                    <p className="text-xs mt-1">to see live tracking</p>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground text-sm">{selectedOrder.order_ref}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${ORDER_STATUS_STYLES[selectedOrder.order_status] || 'bg-gray-100 text-gray-600'}`}>
                          {selectedOrder.order_status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{selectedOrder.shop_name}</p>
                    </div>

                    {/* Progress Bar */}
                    {!['Cancelled', 'Returned'].includes(selectedOrder.order_status) && (
                      <div className="px-5 py-4 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                          {ORDER_STATUS_STEPS.map((step, i) => {
                            const currentStep = getStatusStep(selectedOrder.order_status);
                            const isCompleted = i <= currentStep;
                            const isActive = i === currentStep;
                            return (
                              <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                  isCompleted ? 'bg-primary shadow-rose' : 'bg-secondary border border-border'
                                } ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                  <Icon
                                    name={ORDER_STATUS_ICONS[step] as Parameters<typeof Icon>[0]['name']}
                                    size={13}
                                    className={isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                                  />
                                </div>
                                {i < ORDER_STATUS_STEPS.length - 1 && (
                                  <div className={`h-0.5 w-full mt-3.5 -mb-3.5 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} style={{ position: 'relative', top: '-14px', left: '50%', width: 'calc(100% - 14px)' }} />
                                )}
                                <p className={`text-[9px] mt-1.5 font-semibold ${isActive ? 'text-rose-deep' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timeline Events */}
                    <div className="p-5 max-h-[320px] overflow-y-auto">
                      <h4 className="text-xs font-bold text-muted-foreground mb-3">STATUS HISTORY</h4>
                      {timelineLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : timeline.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No timeline events yet</p>
                      ) : (
                        <div className="space-y-0">
                          {timeline.map((event, i) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                  i === timeline.length - 1 ? 'bg-primary' : 'bg-secondary border border-border'
                                }`}>
                                  <Icon
                                    name={(ORDER_STATUS_ICONS[event.status] || 'ClockIcon') as Parameters<typeof Icon>[0]['name']}
                                    size={13}
                                    className={i === timeline.length - 1 ? 'text-foreground' : 'text-muted-foreground'}
                                  />
                                </div>
                                {i < timeline.length - 1 && <div className="w-0.5 h-8 bg-border mt-1" />}
                              </div>
                              <div className={`pb-4 ${i === timeline.length - 1 ? 'animate-pulse-once' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold ${i === timeline.length - 1 ? 'text-rose-deep' : 'text-foreground'}`}>
                                    {event.status}
                                  </span>
                                  {i === timeline.length - 1 && (
                                    <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">Latest</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {event.created_at ? new Date(event.created_at).toLocaleString() : ''} · {event.updated_by_name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browse Shops Tab */}
        {activeTab === 'shops' && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Browse and shop from all stores on the platform</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_SHOPS.filter(s => s.status === 'active').map(shop => (
                <div key={shop.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-rose transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary shrink-0">
                      <AppImage src={shop.logo} alt={shop.logoAlt} width={56} height={56} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{shop.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{shop.category}</p>
                      <p className="text-xs text-muted-foreground truncate">{shop.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Products', value: shop.products },
                      { label: 'Orders', value: shop.orders.toLocaleString() },
                      { label: 'Customers', value: shop.customers.toLocaleString() },
                    ].map(stat => (
                      <div key={stat.label} className="bg-secondary/50 rounded-xl p-2 text-center">
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <a
                    href="/product-listing"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-foreground text-sm font-semibold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
                  >
                    <Icon name="ShoppingBagIcon" size={15} />
                    Shop Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-muted-foreground">
                <Icon name="HeartIcon" size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Your wishlist is empty</p>
              </div>
            ) : wishlist.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <AppImage src={item.image} alt={item.imageAlt} width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <p className="text-sm font-extrabold text-rose-deep mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1.5 bg-primary text-foreground text-xs font-semibold rounded-lg hover:bg-rose-deep hover:text-white transition-all">Add to Cart</button>
                  <button onClick={() => setWishlist(prev => prev.filter(w => w.id !== item.id))} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {[
              { id: 'addr-1', label: 'Home', address: '123 Maple St', city: 'New York, NY 10001', country: 'USA', isDefault: true },
              { id: 'addr-2', label: 'Work', address: '456 Business Ave, Suite 200', city: 'New York, NY 10002', country: 'USA', isDefault: false },
            ].map(addr => (
              <div key={addr.id} className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="MapPinIcon" size={18} className="text-rose-deep" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground text-sm">{addr.label}</p>
                      {addr.isDefault && <span className="text-[10px] bg-primary/20 text-rose-deep px-2 py-0.5 rounded-full font-semibold">Default</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.country}</p>
                  </div>
                </div>
                <button className="text-xs text-accent hover:text-gold-deep font-semibold transition-colors">Edit</button>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition-all flex items-center justify-center gap-2">
              <Icon name="PlusIcon" size={16} />
              Add New Address
            </button>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {customerReviews.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
                <Icon name="StarIcon" size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : customerReviews.map(review => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground text-sm">{review.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{review.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="StarIcon" size={14} className={i < review.rating ? 'text-amber-400' : 'text-border'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                {review.verified && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <Icon name="CheckBadgeIcon" size={14} className="text-green-600" />
                    <span className="text-xs text-green-600 font-semibold">Verified Purchase</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {feedbackSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <Icon name="CheckCircleIcon" size={18} className="text-green-600" />
                <p className="text-sm text-green-700 font-medium">{feedbackSuccess}</p>
              </div>
            )}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Submit Product Feedback</h3>
              <form onSubmit={submitFeedback} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Product *</label>
                    <select
                      value={feedbackForm.productName}
                      onChange={e => setFeedbackForm(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Select product...</option>
                      {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Rating *</label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))} className="transition-transform hover:scale-110">
                          <Icon name="StarIcon" size={24} className={star <= feedbackForm.rating ? 'text-amber-400' : 'text-border'} />
                        </button>
                      ))}
                      <span className="text-sm font-bold text-foreground ml-1">{feedbackForm.rating}/5</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Review Title *</label>
                  <input type="text" value={feedbackForm.title} onChange={e => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Summarize your experience..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Review *</label>
                  <textarea value={feedbackForm.body} onChange={e => setFeedbackForm(prev => ({ ...prev, body: e.target.value }))} rows={4} placeholder="Share your detailed experience..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
                </div>
                <button type="submit" disabled={feedbackSaving || !feedbackForm.productName || !feedbackForm.title || !feedbackForm.body} className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 text-sm">
                  {feedbackSaving ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
            {myFeedback.length > 0 && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-bold text-foreground">My Feedback History</h3>
                </div>
                <div className="divide-y divide-border">
                  {myFeedback.map(fb => (
                    <div key={fb.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{fb.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{fb.body}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 ml-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icon key={i} name="StarIcon" size={12} className={i < fb.rating ? 'text-amber-400' : 'text-border'} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}