'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import OtpVerification from '@/components/auth/OtpVerification';
import SocialAuthButtons, { type OAuthProvider } from '@/components/auth/SocialAuthButtons';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { authApi } from '@/lib/api';
import { getRoleHomePath } from '@/lib/auth/redirects';

const ROLES = [
  {
    value: 'Customer',
    label: 'Customer',
    desc: 'Shop from all stores',
    icon: 'ShoppingBagIcon',
    color: 'border-green-300 bg-green-50 text-green-700',
  },
  {
    value: 'Staff',
    label: 'Staff',
    desc: 'Manage orders & inventory',
    icon: 'ClipboardDocumentListIcon',
    color: 'border-blue-300 bg-blue-50 text-blue-700',
  },
  {
    value: 'Owner',
    label: 'Owner',
    desc: 'Full store management',
    icon: 'BuildingStorefrontIcon',
    color: 'border-rose-300 bg-rose-50 text-rose-700',
  },
  {
    value: 'Admin',
    label: 'Admin',
    desc: 'System administration',
    icon: 'ShieldCheckIcon',
    color: 'border-purple-300 bg-purple-50 text-purple-700',
  },
];

const PASSWORD_HINT =
  'Use at least 8 characters including one letter and one number (matches server policy).';

export default function RegisterPage() {
  const router = useRouter();
  const { registerPending, confirmRegistration, signInWithOAuth } = useMockAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('Customer');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.includes('@')) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    const pwdOk =
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /\d/.test(form.password);
    if (!pwdOk) e.password = PASSWORD_HINT;
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRoleContinue = () => {
    setRegisterError('');
    if (selectedRole !== 'Customer') {
      setRegisterError(
        'Self-registration is only for shoppers (Customer). Staff, Owner, and Admin accounts are provisioned separately — use Sign in with demo credentials.'
      );
      return;
    }
    setStep(2);
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setRegisterError('');
    setLoading(true);
    try {
      await registerPending({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setStep(3);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (code: string) => {
    const user = await confirmRegistration(form.email.trim(), code);
    router.push(getRoleHomePath(user.role));
  };

  const handleResendRegistrationOtp = () =>
    authApi.sendOtp(form.email.trim().toLowerCase(), 'REGISTER_EMAIL');

  const handleOAuth = async (provider: OAuthProvider) => {
    try {
      const user = await signInWithOAuth(provider);
      router.push(getRoleHomePath(user.role));
    } catch {
      setRegisterError(`Could not sign up with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <AppLogo size={40} />
          <div>
            <p className="font-bold text-lg text-foreground">BS Online Shop</p>
            <p className="text-xs text-muted-foreground">Create your account</p>
          </div>
        </Link>

        <MotionRegisterCard
          step={step}
          registerError={registerError}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          setStep={setStep}
          form={form}
          setForm={setForm}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={loading}
          handleSubmit={handleSubmitDetails}
          handleRoleContinue={handleRoleContinue}
          handleConfirmCode={handleConfirmCode}
          handleResendRegistrationOtp={handleResendRegistrationOtp}
          handleOAuth={handleOAuth}
        />
      </div>
    </div>
  );
}

function MotionRegisterCard(props: {
  step: number;
  registerError: string;
  selectedRole: string;
  setSelectedRole: (r: string) => void;
  setStep: (s: number) => void;
  form: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  errors: Record<string, string>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleRoleContinue: () => void;
  handleConfirmCode: (code: string) => Promise<void>;
  handleResendRegistrationOtp: () => Promise<void>;
  handleOAuth: (p: OAuthProvider) => Promise<void>;
}) {
  const {
    step,
    registerError,
    selectedRole,
    setSelectedRole,
    setStep,
    form,
    setForm,
    errors,
    showPassword,
    setShowPassword,
    loading,
    handleSubmit,
    handleRoleContinue,
    handleConfirmCode,
    handleResendRegistrationOtp,
    handleOAuth,
  } = props;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-8">
      <StepIndicator step={step} />

      {registerError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-5">
          <Icon name="ExclamationCircleIcon" size={16} className="text-red-500" />
          <p className="text-xs text-red-700">{registerError}</p>
        </div>
      )}

      {step === 1 && (
        <RoleStep
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onNext={handleRoleContinue}
        />
      )}

      {step === 2 && (
        <>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-muted-foreground mb-2"
            >
              <Icon name="ArrowLeftIcon" size={18} />
              <span className="text-sm">Back</span>
            </button>
            <h2 className="text-2xl font-extrabold text-foreground">Your details</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Registering as <span className="font-semibold text-accent">{selectedRole}</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(v) => setForm({ ...form, firstName: v })}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(v) => setForm({ ...form, lastName: v })}
                error={errors.lastName}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
            />
            <Input
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              error={errors.phone}
              placeholder="+855 12 345 678"
            />
            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              error={errors.confirmPassword}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary font-bold rounded-xl disabled:opacity-60 min-h-[48px]"
            >
              {loading ? 'Sending OTP…' : 'Continue to verification'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                or continue with social account
              </span>
            </div>
          </div>

          <SocialAuthButtons onProvider={handleOAuth} disabled={loading} />
        </>
      )}

      {step === 3 && (
        <OtpVerification
          email={form.email}
          onSubmitCode={handleConfirmCode}
          onResend={handleResendRegistrationOtp}
          submitLabel="Verify & Create Account"
        />
      )}

      {step < 3 && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-semibold">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex items-center gap-2 ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > s ? 'bg-green-500 text-white' : step === s ? 'bg-primary' : 'bg-secondary'}`}
            >
              {step > s ? <Icon name="CheckIcon" size={14} /> : s}
            </div>
            <span className="text-sm hidden sm:block">
              {s === 1 ? 'Role' : s === 2 ? 'Details' : 'OTP'}
            </span>
          </div>
          {s < 3 && <MotionStepLine step={step} s={s} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function MotionStepLine({ step, s }: { step: number; s: number }) {
  return <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-green-500' : 'bg-border'}`} />;
}

function RoleStep({
  selectedRole,
  setSelectedRole,
  onNext,
}: {
  selectedRole: string;
  setSelectedRole: (r: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-2">Select your role</h2>
      <div className="grid grid-cols-2 gap-3 mb-8 mt-6">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className={`p-4 rounded-xl border-2 text-left ${selectedRole === role.value ? role.color : 'border-border bg-secondary/30'}`}
          >
            <Icon
              name={role.icon as Parameters<typeof Icon>[0]['name']}
              size={22}
              className="mb-2"
            />
            <p className="font-bold text-sm">{role.label}</p>
            <p className="text-xs opacity-70">{role.desc}</p>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNext}
        className="w-full py-3.5 bg-primary font-bold rounded-xl min-h-[48px]"
      >
        Continue as {selectedRole}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
