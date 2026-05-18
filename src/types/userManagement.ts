// src/types/userManagement.ts
// Place this file at: src/types/userManagement.ts
// All imports use: @/types/userManagement

export type UserRole = 'Admin' | 'Owner' | 'Staff' | 'Customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface ActivityLog {
  action: string;
  timestamp: string;
  detail?: string;
}

export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string;
  shopName?: string;
  joinedAt: string;
  lastActive: string;
  avatar?: string;
  phone?: string;
  activityLog: ActivityLog[];
}

// ─── Style maps ───────────────────────────────────────────────────────────────

export const STATUS_STYLES: Record<UserStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-secondary text-muted-foreground border-border',
  suspended: 'bg-red-50 text-red-700 border-red-200',
};

export const ROLE_STYLES: Record<UserRole, string> = {
  Admin: 'bg-purple-50 text-purple-700',
  Owner: 'bg-rose-50 text-rose-700',
  Staff: 'bg-blue-50 text-blue-700',
  Customer: 'bg-green-50 text-green-700',
};

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_CUSTOMERS: ManagedUser[] = [
  {
    id: 'c1',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    email: 'emma@example.com',
    role: 'Customer',
    status: 'active',
    joinedAt: 'Jan 10, 2026',
    lastActive: 'May 12, 2026',
    phone: '+1 555-1001',
    activityLog: [
      { action: 'Placed order #ORD-2847', timestamp: 'May 12, 2026 14:32' },
      { action: 'Updated profile', timestamp: 'Apr 20, 2026 09:10' },
    ],
  },
  {
    id: 'c2',
    firstName: 'Mei-Lin',
    lastName: 'Tanaka',
    email: 'meilin@example.com',
    role: 'Customer',
    status: 'active',
    joinedAt: 'Feb 03, 2026',
    lastActive: 'May 12, 2026',
    phone: '+81 90-1234-5678',
    activityLog: [{ action: 'Placed order #ORD-2846', timestamp: 'May 12, 2026 11:05' }],
  },
  {
    id: 'c3',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    role: 'Customer',
    status: 'active',
    joinedAt: 'Mar 15, 2026',
    lastActive: 'May 11, 2026',
    phone: '+91 98765-43210',
    activityLog: [{ action: 'Placed order #ORD-2845', timestamp: 'May 11, 2026 16:44' }],
  },
  {
    id: 'c4',
    firstName: 'Sophie',
    lastName: 'Williams',
    email: 'sophie@example.com',
    role: 'Customer',
    status: 'inactive',
    joinedAt: 'Nov 22, 2025',
    lastActive: 'Feb 01, 2026',
    phone: '+44 7700 900123',
    activityLog: [{ action: 'Account deactivated', timestamp: 'Feb 01, 2026 08:00' }],
  },
  {
    id: 'c5',
    firstName: 'Aiko',
    lastName: 'Nakamura',
    email: 'aiko@example.com',
    role: 'Customer',
    status: 'active',
    joinedAt: 'Dec 05, 2025',
    lastActive: 'May 10, 2026',
    phone: '+81 80-9876-5432',
    activityLog: [{ action: 'Placed order #ORD-2843', timestamp: 'May 10, 2026 09:22' }],
  },
  {
    id: 'c6',
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    email: 'fatima@example.com',
    role: 'Customer',
    status: 'suspended',
    joinedAt: 'Oct 11, 2025',
    lastActive: 'May 10, 2026',
    phone: '+971 50 123 4567',
    activityLog: [
      { action: 'Order #ORD-2842 cancelled', timestamp: 'May 10, 2026 07:55' },
      { action: 'Account suspended — chargeback', timestamp: 'May 10, 2026 08:30' },
    ],
  },
  {
    id: 'c7',
    firstName: 'Lena',
    lastName: 'Müller',
    email: 'lena@example.com',
    role: 'Customer',
    status: 'active',
    joinedAt: 'Apr 01, 2026',
    lastActive: 'May 09, 2026',
    phone: '+49 170 1234567',
    activityLog: [{ action: 'Registered account', timestamp: 'Apr 01, 2026 10:00' }],
  },
];

export const MOCK_SHOPS = [
  { id: 'shop1', name: 'Glow Beauty Store', status: 'active' as const },
  { id: 'shop2', name: 'Skin Essentials', status: 'active' as const },
  { id: 'shop3', name: 'Pure Radiance', status: 'pending' as const },
];

export const MOCK_SHOP_USERS: ManagedUser[] = [
  {
    id: 'u1',
    firstName: 'Sarah',
    lastName: 'Kim',
    email: 'sarah@glowbeauty.com',
    role: 'Owner',
    status: 'active',
    shopId: 'shop1',
    shopName: 'Glow Beauty Store',
    joinedAt: 'Jan 05, 2026',
    lastActive: 'May 13, 2026',
    phone: '+1 555-2001',
    activityLog: [
      { action: 'Updated shop settings', timestamp: 'May 13, 2026 09:00' },
      { action: 'Added 12 products', timestamp: 'May 10, 2026 14:30' },
    ],
  },
  {
    id: 'u2',
    firstName: 'Jake',
    lastName: 'Patel',
    email: 'jake@glowbeauty.com',
    role: 'Staff',
    status: 'active',
    shopId: 'shop1',
    shopName: 'Glow Beauty Store',
    joinedAt: 'Feb 14, 2026',
    lastActive: 'May 13, 2026',
    phone: '+1 555-2002',
    activityLog: [{ action: 'Processed 5 orders', timestamp: 'May 13, 2026 11:20' }],
  },
  {
    id: 'u3',
    firstName: 'Nina',
    lastName: 'Torres',
    email: 'nina@glowbeauty.com',
    role: 'Staff',
    status: 'inactive',
    shopId: 'shop1',
    shopName: 'Glow Beauty Store',
    joinedAt: 'Mar 01, 2026',
    lastActive: 'Apr 15, 2026',
    phone: '+1 555-2003',
    activityLog: [{ action: 'Last login', timestamp: 'Apr 15, 2026 10:00' }],
  },
  {
    id: 'u4',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david@skinessentials.com',
    role: 'Owner',
    status: 'active',
    shopId: 'shop2',
    shopName: 'Skin Essentials',
    joinedAt: 'Dec 20, 2025',
    lastActive: 'May 12, 2026',
    phone: '+65 9123 4567',
    activityLog: [{ action: 'Updated pricing rules', timestamp: 'May 12, 2026 15:00' }],
  },
  {
    id: 'u5',
    firstName: 'Yuki',
    lastName: 'Sato',
    email: 'yuki@skinessentials.com',
    role: 'Staff',
    status: 'active',
    shopId: 'shop2',
    shopName: 'Skin Essentials',
    joinedAt: 'Jan 15, 2026',
    lastActive: 'May 12, 2026',
    phone: '+65 9234 5678',
    activityLog: [{ action: 'Managed inventory', timestamp: 'May 12, 2026 12:00' }],
  },
  {
    id: 'u6',
    firstName: 'Marco',
    lastName: 'Rossi',
    email: 'marco@skinessentials.com',
    role: 'Staff',
    status: 'suspended',
    shopId: 'shop2',
    shopName: 'Skin Essentials',
    joinedAt: 'Feb 28, 2026',
    lastActive: 'May 01, 2026',
    phone: '+39 02 1234567',
    activityLog: [{ action: 'Account suspended', timestamp: 'May 01, 2026 08:00' }],
  },
  {
    id: 'u7',
    firstName: 'Aisha',
    lastName: 'Okafor',
    email: 'aisha@pureradiance.com',
    role: 'Owner',
    status: 'active',
    shopId: 'shop3',
    shopName: 'Pure Radiance',
    joinedAt: 'Apr 10, 2026',
    lastActive: 'May 11, 2026',
    phone: '+234 801 234 5678',
    activityLog: [{ action: 'Shop registered', timestamp: 'Apr 10, 2026 10:00' }],
  },
];
