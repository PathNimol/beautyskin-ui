'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const ROLES = [
  { value: 'Buyer', label: 'Buyer', desc: 'Shop skincare products', icon: 'ShoppingBagIcon', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'Staff', label: 'Staff', desc: 'Manage orders & inventory', icon: 'ClipboardDocumentListIcon', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { value: 'Owner', label: 'Owner', desc: 'Full store management', icon: 'BuildingStorefrontIcon', color: 'border-rose-300 bg-rose-50 text-rose-700' },
  { value: 'Admin', label: 'Admin', desc: 'System administration', icon: 'ShieldCheckIcon', color: 'border-purple-300 bg-purple-50 text-purple-700' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('Buyer');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <AppLogo size={40} />
          </Link>
          <div>
            <p className="font-bold text-lg text-foreground">BS Online Shop</p>
            <p className="text-xs text-muted-foreground">Create your account</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {step > s ? <Icon name="CheckIcon" size={14} /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s === 1 ? 'Choose Role' : 'Your Details'}</span>
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Select your role</h2>
              <p className="text-muted-foreground text-sm mb-6">Choose the role that best describes how you&apos;ll use BS Online Shop</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-soft ${selectedRole === role.value ? role.color + ' border-2' : 'border-border bg-secondary/30 hover:bg-secondary'}`}
                  >
                    <Icon name={role.icon as Parameters<typeof Icon>[0]['name']} size={22} className="mb-2" />
                    <p className="font-bold text-sm">{role.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{role.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose min-h-[48px]"
              >
                Continue as {selectedRole}
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-2 mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="ArrowLeftIcon" size={18} />
                </button>
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground">Your details</h2>
                  <p className="text-sm text-muted-foreground">Registering as <span className="font-semibold text-accent">{selectedRole}</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Emma"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Rodriguez"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-gold-deep font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
