'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { startNavigation } from '@/lib/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';
import SocialAuthButtons, { type OAuthProvider } from '@/components/auth/SocialAuthButtons';
import { resolvePostLoginPath } from '@/lib/auth/redirects';

const ROLE_HINTS = [
  {
    role: 'Super Admin',
    email: 'admin@beautyskin.com',
    password: 'admin123',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    role: 'Shop Owner',
    email: 'owner@beautyskin.com',
    password: 'owner123',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    role: 'Staff',
    email: 'staff@beautyskin.com',
    password: 'staff123',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: 'Customer',
    email: 'buyer@beautyskin.com',
    password: 'buyer123',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithOAuth, isAuthenticated, user, loading: authLoading } = useMockAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigatingRef = useRef(false);

  const redirectParam = searchParams.get('redirect');

  const goAfterLogin = useCallback(
    (redirect: string | null, role: string) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      const dest = resolvePostLoginPath(redirect, role);
      startNavigation();
      router.replace(dest);
    },
    [router]
  );

  // Warm likely post-login routes (client navigation is much faster than full reload)
  useEffect(() => {
    router.prefetch('/owner/dashboard');
    router.prefetch('/admin/dashboard');
    router.prefetch('/staff/dashboard');
    router.prefetch('/customer/products');
  }, [router]);

  // Already signed in — send to role dashboard (not marketing home)
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user || loading) return;
    goAfterLogin(redirectParam, user.role);
  }, [authLoading, isAuthenticated, user, redirectParam, goAfterLogin, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const signedInUser = await signIn(email, password);
      setLoading(false);
      goAfterLogin(redirectParam, signedInUser.role);
    } catch {
      setError('Invalid email or password. Try demo credentials below or register.');
      setLoading(false);
      navigatingRef.current = false;
    }
  };

  // OAuth is now a plain redirect — no async, no try/catch needed
  const handleOAuth = (provider: OAuthProvider) => {
    setError('');
    signInWithOAuth(provider);
    // Browser will redirect to Google/Facebook — no further action here
  };

  return (
    <MotionLoginForm
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      error={error}
      loading={loading}
      handleLogin={handleLogin}
      handleOAuth={handleOAuth}
      fillCredentials={(e, p) => {
        setEmail(e);
        setPassword(p);
        setError('');
      }}
    />
  );
}

function MotionLoginForm(props: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  handleOAuth: (p: OAuthProvider) => void;
  fillCredentials: (e: string, p: string) => void;
}) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleLogin,
    handleOAuth,
    fillCredentials,
  } = props;

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex lg:hidden items-center gap-3 mb-8">
          <AppLogo size={200} />
          <span className="font-bold text-xl text-foreground">BS Online Shop</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 mt-2">
          <fieldset disabled={loading} className="space-y-5 border-0 p-0 m-0 min-w-0">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </fieldset>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:text-gold-deep font-semibold">
            Create account
          </Link>
        </p>

        <div className="mt-8 p-5 bg-secondary/60 rounded-2xl border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_HINTS.map((hint) => (
              <button
                key={hint.role}
                type="button"
                disabled={loading}
                onClick={() => fillCredentials(hint.email, hint.password)}
                className={`text-left p-3 rounded-xl border text-xs transition-all hover:shadow-soft disabled:opacity-50 ${hint.color}`}
              >
                <p className="font-bold">{hint.role}</p>
                <p className="opacity-70 mt-0.5 truncate">{hint.email}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium">
              or continue with social account
            </span>
          </div>
        </div>

        <SocialAuthButtons onProvider={handleOAuth} disabled={loading} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rose-gradient-bg items-center justify-center p-12">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="relative z-10 text-center max-w-md">
          <Link href="/" className="flex justify-center mb-8">
            <AppLogo size={500} />
          </Link>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
