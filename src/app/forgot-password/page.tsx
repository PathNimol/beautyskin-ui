'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const VALID_EMAILS = [
  'admin@beautyskin.com',
  'owner@beautyskin.com',
  'staff@beautyskin.com',
  'buyer@beautyskin.com',
];

type Step = 'email' | 'otp' | 'reset' | 'done';

// ── Password strength helper ──────────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: 'bg-red-400' };
  if (s <= 3) return { score: s, label: 'Fair', color: 'bg-amber-400' };
  return { score: s, label: 'Strong', color: 'bg-green-500' };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const strength = passwordStrength(newPassword);

  // Step 1: Send reset link
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 900);
  };

  // Step 2: OTP entry
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setStep('reset');
      } else {
        setError('Invalid OTP. Use 123456 for demo.');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    }, 900);
  };

  // Step 3: New password
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <AppLogo size={40} />
          </Link>
          <div>
            <p className="font-bold text-lg text-foreground">BS Online Shop</p>
            <p className="text-xs text-muted-foreground">Password recovery</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          {/* ── Step indicator ── */}
          {step !== 'done' && (
            <div className="flex items-center gap-2 mb-8">
              {(['email', 'otp', 'reset'] as Step[]).map((s, idx) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? 'bg-primary text-foreground'
                        : (['email', 'otp', 'reset'] as Step[]).indexOf(step) > idx
                          ? 'bg-green-500 text-white'
                          : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {(['email', 'otp', 'reset'] as Step[]).indexOf(step) > idx ? (
                      <Icon name="CheckIcon" size={12} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-0.5 rounded-full transition-all ${(['email', 'otp', 'reset'] as Step[]).indexOf(step) > idx ? 'bg-green-500' : 'bg-border'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Email Step ── */}
          {step === 'email' && (
            <>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="LockClosedIcon" size={26} className="text-rose-deep" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">
                Forgot your password?
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your email address and we&apos;ll send you a verification code.
              </p>
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Try: admin@beautyskin.com, buyer@beautyskin.com
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── OTP Step ── */}
          {step === 'otp' && (
            <>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="DevicePhoneMobileIcon" size={26} className="text-rose-deep" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">
                Enter verification code
              </h2>
              <p className="text-muted-foreground text-sm mb-1">A 6-digit code was sent to</p>
              <p className="text-sm font-semibold text-foreground mb-6">{email}</p>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleOtpSubmit}>
                <div className="flex gap-2 justify-between mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Demo hint: use{' '}
                  <span className="font-mono font-semibold text-foreground">123456</span>
                </p>
              </form>
            </>
          )}

          {/* ── Reset Password Step ── */}
          {step === 'reset' && (
            <>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="KeyIcon" size={26} className="text-rose-deep" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Set new password</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Choose a strong password for your account.
              </p>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-border'}`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-medium ${strength.score <= 1 ? 'text-red-500' : strength.score <= 3 ? 'text-amber-600' : 'text-green-600'}`}
                      >
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Success Step ── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="CheckCircleIcon" size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-3">Password reset!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your password has been updated successfully. You can now sign in with your new
                password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose"
              >
                <Icon name="ArrowRightIcon" size={16} />
                Go to Sign In
              </Link>
            </div>
          )}

          {/* Back to login link */}
          {step !== 'done' && (
            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ArrowLeftIcon" size={15} />
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
