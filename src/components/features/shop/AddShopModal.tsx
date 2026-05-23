'use client';

import React, { useRef, useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { type NewShopForm, uploadLogo } from './shop-types';
import { getUsersByRole } from '@/lib/api/services/users';
import { useMockAuth } from '@/contexts/MockAuthContext';
import type { ApiUser } from '@/lib/api';

interface AddShopModalProps {
  onClose: () => void;
  onSuccess: (shop: NewShopForm) => Promise<void>;
  adding: boolean;
}

const FIELDS = [
  { label: 'Shop Name', key: 'name', placeholder: 'e.g. Glow Beauty Store' },
  { label: 'Description', key: 'description', placeholder: 'Brief shop description' },
  { label: 'Category', key: 'category', placeholder: 'e.g. Serums & Moisturizers' },
] as const;

export default function AddShopModal({ onClose, onSuccess, adding }: AddShopModalProps) {
  const { user, role } = useMockAuth();
  const isAdmin = role === 'admin';

  const [form, setForm] = useState<NewShopForm>({
    name: '',
    owner_name: isAdmin ? '' : (user?.name ?? ''),
    description: '',
    category: '',
    logo: '',
    status: isAdmin ? 'active' : 'pending',
  });

  // Owner search (admin only)
  const [owners, setOwners] = useState<ApiUser[]>([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<ApiUser | null>(null);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const ownerRef = useRef<HTMLDivElement>(null);

  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Fetch owners when admin opens modal
  useEffect(() => {
    if (!isAdmin) return;
    setOwnersLoading(true);
    getUsersByRole('OWNER')
      .then(setOwners)
      .catch(() => setOwners([]))
      .finally(() => setOwnersLoading(false));
  }, [isAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
        setOwnerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredOwners = owners.filter((o) => {
    const full = `${o.firstName} ${o.lastName}`.toLowerCase();
    return (
      full.includes(ownerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(ownerSearch.toLowerCase())
    );
  });

  const handleSelectOwner = (owner: ApiUser) => {
    setSelectedOwner(owner);
    setOwnerSearch(`${owner.firstName} ${owner.lastName}`);
    setForm((prev) => ({ ...prev, owner_name: `${owner.firstName} ${owner.lastName}` }));
    setOwnerDropdownOpen(false);
  };

  // Logo handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Only image files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('File must be under 2MB.');
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    // Auto-upload immediately
    setLogoUploading(true);
    try {
      const token = localStorage.getItem('bs_auth_tokens')
        ? JSON.parse(localStorage.getItem('bs_auth_tokens')!).accessToken
        : '';
      const url = await uploadLogo(file, token);
      setForm((prev) => ({ ...prev, logo: url }));
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setLogoUploading(true);
    setLogoError('');
    try {
      const token = localStorage.getItem('bs_auth_tokens')
        ? JSON.parse(localStorage.getItem('bs_auth_tokens')!).accessToken
        : '';
      const url = await uploadLogo(logoFile, token);
      setForm((prev) => ({ ...prev, logo: url }));
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setForm((prev) => ({ ...prev, logo: '' }));
    setLogoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    if (isAdmin && !selectedOwner) return;
    if (logoFile && !form.logo) await handleUploadLogo();
    await onSuccess(form);
  };

  const canSubmit = form.name && (isAdmin ? !!selectedOwner : true) && !adding && !logoUploading;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-bold text-foreground">Register New Shop</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Logo upload */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Shop Logo{' '}
              <span className="text-muted-foreground/60 normal-case font-normal">
                (optional, max 2MB)
              </span>
            </label>
            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border bg-background">
                  <AppImage
                    src={logoPreview}
                    alt="Logo preview"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{logoFile?.name}</p>
                  {logoUploading && <p className="text-[11px] text-blue-500 mt-0.5">Uploading…</p>}
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon name="PhotoIcon" size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Click to upload logo</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    JPG, PNG, WebP — max 2MB
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {logoError && (
              <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                <Icon name="ExclamationTriangleIcon" size={12} /> {logoError}
              </p>
            )}
          </div>

          {/* Text fields */}
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          ))}

          {/* Owner field */}
          {isAdmin ? (
            // Admin: searchable dropdown
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Owner <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={ownerRef}>
                <div className="relative">
                  <Icon
                    name="MagnifyingGlassIcon"
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={
                      ownersLoading ? 'Loading owners…' : 'Search owner by name or email…'
                    }
                    value={ownerSearch}
                    disabled={ownersLoading}
                    onChange={(e) => {
                      setOwnerSearch(e.target.value);
                      setOwnerDropdownOpen(true);
                      if (!e.target.value) {
                        setSelectedOwner(null);
                        setForm((prev) => ({ ...prev, owner_name: '' }));
                      }
                    }}
                    onFocus={() => setOwnerDropdownOpen(true)}
                    className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                  />
                  {selectedOwner && (
                    <button
                      onClick={() => {
                        setSelectedOwner(null);
                        setOwnerSearch('');
                        setForm((prev) => ({ ...prev, owner_name: '' }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="XMarkIcon" size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {ownerDropdownOpen && !ownersLoading && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {filteredOwners.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        No owners found
                      </div>
                    ) : (
                      filteredOwners.map((owner) => (
                        <button
                          key={owner.id}
                          onClick={() => handleSelectOwner(owner)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-all text-left ${
                            selectedOwner?.id === owner.id ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-rose-deep">
                            {owner.firstName?.[0]}
                            {owner.lastName?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {owner.firstName} {owner.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {owner.email}
                            </p>
                          </div>
                          {selectedOwner?.id === owner.id && (
                            <Icon name="CheckIcon" size={14} className="text-primary shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {!selectedOwner && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Select an owner from the list
                </p>
              )}
            </div>
          ) : (
            // Owner role: auto-filled, read-only
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Owner
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/50 border border-border rounded-xl">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-rose-deep">
                  {user?.name?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground">Auto-assigned as owner</p>
                </div>
                <Icon name="LockClosedIcon" size={13} className="text-muted-foreground shrink-0" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-secondary text-foreground text-sm font-semibold rounded-xl hover:bg-border transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50"
            >
              {adding ? 'Registering…' : 'Register Shop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
