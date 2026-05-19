'use client';

import { MOCK_USERS, type MockUser, type UserRole } from '@/lib/mock/data';

const REGISTERED_USERS_KEY = 'bs_registered_users';
const OTP_KEY_PREFIX = 'bs_otp_';
export const OTP_DURATION_SEC = 300; // 5 minutes

export interface ShippingProfile {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface StoredOtp {
  code: string;
  email: string;
  expiresAt: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
}

const ACCESS_TTL_MS = 60 * 60 * 1000; // 1 hour
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateId() {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createTokens(): AuthTokens {
  const now = Date.now();
  return {
    accessToken: generateToken(),
    refreshToken: generateToken(),
    accessExpiresAt: now + ACCESS_TTL_MS,
    refreshExpiresAt: now + REFRESH_TTL_MS,
  };
}

export function isAccessExpired(tokens: AuthTokens) {
  return Date.now() >= tokens.accessExpiresAt;
}

export function refreshAccessToken(tokens: AuthTokens): AuthTokens | null {
  if (Date.now() >= tokens.refreshExpiresAt) return null;
  const now = Date.now();
  return {
    ...tokens,
    accessToken: generateToken(),
    accessExpiresAt: now + ACCESS_TTL_MS,
  };
}

function readRegistered(): MockUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}

function writeRegistered(users: MockUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

/** All users: built-in demo accounts + registered users */
export function getAllUsers(): MockUser[] {
  const registered = readRegistered();
  const builtinIds = new Set(MOCK_USERS.map((u) => u.id));
  const extra = registered.filter((u) => !builtinIds.has(u.id));
  return [...MOCK_USERS, ...extra];
}

export function findUserByEmail(email: string): MockUser | undefined {
  return getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): MockUser | undefined {
  return getAllUsers().find((u) => u.id === id);
}

const ROLE_MAP: Record<string, UserRole> = {
  Buyer: 'customer',
  Customer: 'customer',
  Staff: 'staff',
  Owner: 'owner',
  Admin: 'admin',
};

export function mapRegisterRole(uiRole: string): UserRole {
  return ROLE_MAP[uiRole] ?? 'customer';
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export function registerUser(input: RegisterInput): MockUser {
  if (findUserByEmail(input.email)) {
    throw new Error('An account with this email already exists.');
  }

  const user: MockUser = {
    id: generateId(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    role: input.role,
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_16b7f3773-1772140653588.png',
    avatarAlt: `${input.firstName} profile photo`,
    phone: input.phone.trim(),
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    shipping: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'Cambodia',
    },
  };

  const registered = readRegistered();
  registered.push(user);
  writeRegistered(registered);
  return user;
}

export function updateUserProfile(userId: string, patch: Partial<MockUser>): MockUser | null {
  const registered = readRegistered();
  const idx = registered.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    registered[idx] = { ...registered[idx], ...patch };
    writeRegistered(registered);
    return registered[idx];
  }
  return findUserById(userId) ?? null;
}

export function generateOtp(email: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const payload: StoredOtp = {
    code,
    email: email.toLowerCase(),
    expiresAt: Date.now() + OTP_DURATION_SEC * 1000,
  };
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`${OTP_KEY_PREFIX}${email.toLowerCase()}`, JSON.stringify(payload));
  }
  return code;
}

export function verifyOtp(email: string, code: string): { valid: boolean; expired?: boolean } {
  if (typeof window === 'undefined') return { valid: false };
  const raw = sessionStorage.getItem(`${OTP_KEY_PREFIX}${email.toLowerCase()}`);
  if (!raw) return { valid: code === '123456' }; // fallback for demo without send step
  try {
    const stored = JSON.parse(raw) as StoredOtp;
    if (Date.now() > stored.expiresAt) return { valid: false, expired: true };
    if (stored.code === code || code === '123456') {
      sessionStorage.removeItem(`${OTP_KEY_PREFIX}${email.toLowerCase()}`);
      return { valid: true };
    }
    return { valid: false };
  } catch {
    return { valid: code === '123456' };
  }
}

export function getOtpRemainingSeconds(email: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = sessionStorage.getItem(`${OTP_KEY_PREFIX}${email.toLowerCase()}`);
  if (!raw) return 0;
  try {
    const stored = JSON.parse(raw) as StoredOtp;
    return Math.max(0, Math.ceil((stored.expiresAt - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

/** Mock OAuth — creates or finds a customer account */
export function oauthSignIn(
  provider: 'google' | 'facebook' | 'tiktok',
  email?: string
): MockUser {
  const providerEmails: Record<string, string> = {
    google: 'google.user@beautyskin.com',
    facebook: 'facebook.user@beautyskin.com',
    tiktok: 'tiktok.user@beautyskin.com',
  };
  const resolvedEmail = (email || providerEmails[provider]).toLowerCase();
  let user = findUserByEmail(resolvedEmail);
  if (!user) {
    user = registerUser({
      firstName: provider.charAt(0).toUpperCase() + provider.slice(1),
      lastName: 'User',
      email: resolvedEmail,
      password: `oauth-${provider}`,
      phone: '',
      role: 'customer',
    });
  }
  return user;
}
