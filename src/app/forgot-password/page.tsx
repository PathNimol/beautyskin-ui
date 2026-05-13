'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const VALID_EMAILS = ['admin@beautyskin.com', 'owner@beautyskin.com', 'staff@beautyskin.com', 'buyer@beautyskin.com'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
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
          {!sent ? (
            <>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="LockClosedIcon" size={26} className="text-rose-deep" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Forgot your password?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="EnvelopeIcon" size={30} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-3">Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-2">
                We&apos;ve sent a password reset link to
              </p>
              <p className="font-semibold text-foreground text-sm mb-6">{email}</p>
              <div className="p-4 bg-secondary/60 rounded-xl border border-border mb-6">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Demo note:</span> This is a mock flow. No actual email is sent. In production, a real reset link would be delivered.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm text-accent hover:text-gold-deep font-semibold transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowLeftIcon" size={15} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
