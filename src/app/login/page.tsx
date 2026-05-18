'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useMockAuth } from '@/contexts/MockAuthContext';

const ROLE_HINTS = [
  {
    role: 'Super Admin',
    email: 'admin@beautyskin.com',
    password: 'admin123',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    redirect: '/admin/dashboard',
  },
  {
    role: 'Shop Owner',
    email: 'owner@beautyskin.com',
    password: 'owner123',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    redirect: '/owner/dashboard',
  },
  {
    role: 'Staff',
    email: 'staff@beautyskin.com',
    password: 'staff123',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    redirect: '/staff/dashboard',
  },
  {
    role: 'Customer',
    email: 'buyer@beautyskin.com',
    password: 'buyer123',
    color: 'bg-green-50 text-green-700 border-green-200',
    redirect: '/customer/account',
  },
];

// ── OTP Verification Modal ────────────────────────────────────────────────────
function OtpModal({
  email,
  onSuccess,
  onClose,
}: {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const refs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    // Mock: accept "123456" as valid OTP
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setVerified(true);
        setTimeout(onSuccess, 1800);
      } else {
        setError('Invalid OTP. Use 123456 for demo.');
        setOtp(['', '', '', '', '', '']);
        refs[0].current?.focus();
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-card w-full max-w-sm p-8 relative">
        {!verified ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-5">
              <Icon name="DevicePhoneMobileIcon" size={22} className="text-rose-deep" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-1">Verify your identity</h3>
            <p className="text-sm text-muted-foreground mb-1">Enter the 6-digit code sent to</p>
            <p className="text-sm font-semibold text-foreground mb-6">{email}</p>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
                <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2 justify-between mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />{' '}
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Demo hint: use <span className="font-mono font-semibold text-foreground">123456</span>
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon name="CheckCircleIcon" size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Verified!</h3>
            <p className="text-sm text-muted-foreground">Identity confirmed. Signing you in…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useMockAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      const hint = ROLE_HINTS.find((h) => h.email === email);
      const redirect = hint?.redirect ?? '/admin/dashboard';
      setPendingRedirect(redirect);
      setLoading(false);
      setShowOtp(true); // always require OTP after credential check
    } catch {
      setError('Invalid email or password. Use the demo credentials below.');
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtp(false);
    router.push(pendingRedirect);
  };

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <>
      {showOtp && (
        <OtpModal email={email} onSuccess={handleOtpSuccess} onClose={() => setShowOtp(false)} />
      )}

      <div className="min-h-screen bg-background flex">
        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rose-gradient-bg items-center justify-center p-12">
          <div className="absolute inset-0 dot-pattern opacity-40" />
          <div className="relative z-10 text-center max-w-md">
            <div className="flex justify-center mb-8">
              <AppLogo size={72} />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">
              BS Online Shop
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Multi-tenant skincare management platform for beauty professionals.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '4 Shops', desc: 'Active on Platform' },
                { label: '1,284', desc: 'Products in Stock' },
                { label: '$264K', desc: 'Platform Revenue' },
                { label: '4.7★', desc: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label} className="admin-glass rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <AppLogo size={40} />
              <span className="font-bold text-xl text-foreground">BS Online Shop</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                Welcome back
              </h2>
              <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-foreground">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent hover:text-gold-deep transition-colors font-medium"
                  >
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
                    className="w-full px-4 py-3 pr-12 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
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
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-accent hover:text-gold-deep font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-8 p-5 bg-secondary/60 rounded-2xl border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_HINTS.map((hint) => (
                  <button
                    key={hint.role}
                    onClick={() => fillCredentials(hint.email, hint.password)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all hover:shadow-soft ${hint.color}`}
                  >
                    <p className="font-bold">{hint.role}</p>
                    <p className="opacity-70 mt-0.5 truncate">{hint.email}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Click a role to auto-fill · OTP verification uses{' '}
                <span className="font-mono font-semibold">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
