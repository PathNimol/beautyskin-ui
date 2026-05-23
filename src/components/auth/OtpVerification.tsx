'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

const DEFAULT_OTP_UI_TTL_SEC = 600;

interface OtpVerificationProps {
  email: string;
  /** Called with the 6-digit code from the user; errors should throw or surface via ApiError message. */
  onSubmitCode: (code: string) => Promise<void>;
  /** Optional resend handler (e.g. POST /auth/otp/send with REGISTER_EMAIL). */
  onResend?: () => Promise<void>;
  title?: string;
  submitLabel?: string;
  /** Informational countdown shown in the UI (API TTL may differ slightly). */
  otpTtlSeconds?: number;
}

export default function OtpVerification({
  email,
  onSubmitCode,
  onResend,
  title = 'Verify your email',
  submitLabel = 'Verify OTP',
  otpTtlSeconds = DEFAULT_OTP_UI_TTL_SEC,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [remaining, setRemaining] = useState(otpTtlSeconds);
  const [tickToken, setTickToken] = useState(0);
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    const started = Date.now();
    setRemaining(otpTtlSeconds);
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setRemaining(Math.max(0, otpTtlSeconds - elapsed));
    }, 1000);
    return () => clearInterval(t);
  }, [email, otpTtlSeconds, tickToken]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  const handleResend = async () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    refs[0].current?.focus();
    try {
      if (onResend) await onResend();
      setTickToken((x) => x + 1);
    } catch {
      setError('Could not resend code. Try again shortly.');
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmitCode(code);
      setVerified(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setError(msg);
      setOtp(['', '', '', '', '', '']);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return <VerifiedSuccess />;
  }

  return (
    <form onSubmit={(e) => void handleVerify(e)}>
      <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
        <Icon name="DevicePhoneMobileIcon" size={26} className="text-rose-deep" />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm mb-1">6-digit code sent to</p>
      <p className="text-sm font-semibold text-foreground mb-6">{email}</p>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
          <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2 justify-between mb-4">
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

      <p className="text-center text-xs text-muted-foreground mb-4">
        {remaining > 0 ? (
          <>
            Code expires in{' '}
            <span className="font-mono font-semibold text-foreground">{formatTime(remaining)}</span>
          </>
        ) : (
          <span className="text-amber-700 font-medium">Code may have expired — request a new one below.</span>
        )}
      </p>

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
          submitLabel
        )}
      </button>

      <button
        type="button"
        onClick={() => void handleResend()}
        className="w-full mt-3 text-sm text-accent hover:text-gold-deep font-semibold"
      >
        Resend code
      </button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Enter the OTP from your email (dev builds may log OTP when SMTP is off).
      </p>
    </form>
  );
}

function VerifiedSuccess() {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="CheckCircleIcon" size={40} className="text-green-600" />
      </div>
      <h3 className="text-2xl font-extrabold text-foreground mb-2">Verified!</h3>
      <p className="text-muted-foreground text-sm">Continuing…</p>
    </div>
  );
}
