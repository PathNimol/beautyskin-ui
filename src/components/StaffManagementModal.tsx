'use client';

import React, { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRealtimeStaff, type DbStaff } from '@/hooks/useRealtimeData';
import { shopStaffApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type StaffRole = 'Owner' | 'Manager' | 'Staff' | 'Cashier';

interface ParsedRow {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  valid: boolean;
  errors: string[];
}

interface StaffManagementModalProps {
  shopId: string;
  shopName: string;
  onClose: () => void;
}

const ROLE_COLORS: Record<StaffRole, string> = {
  Owner: 'bg-rose-50 text-rose-700',
  Manager: 'bg-purple-50 text-purple-700',
  Staff: 'bg-blue-50 text-blue-700',
  Cashier: 'bg-green-50 text-green-700',
};

const VALID_ROLES: StaffRole[] = ['Owner', 'Manager', 'Staff', 'Cashier'];

// ─── CSV/Excel Parser ─────────────────────────────────────────────────────────
function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] || ''; });

    const name = row['name'] || row['full name'] || row['fullname'] || '';
    const email = row['email'] || row['email address'] || '';
    const phone = row['phone'] || row['mobile'] || row['phone number'] || '';
    const rawRole = row['role'] || 'Staff';
    const role = (VALID_ROLES.includes(rawRole as StaffRole) ? rawRole : 'Staff') as StaffRole;

    const errors: string[] = [];
    if (!name.trim()) errors.push('Name is required');
    if (!email.trim()) errors.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format');

    return { name: name.trim(), email: email.trim(), phone: phone.trim(), role, valid: errors.length === 0, errors };
  }).filter(r => r.name || r.email);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffManagementModal({ shopId, shopName, onClose }: StaffManagementModalProps) {
  const { staff, loading, inserting, batchInsertStaff, removeStaffMember, updateStaffRole, refetch } = useRealtimeStaff(shopId);

  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'add'>('list');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkRole, setBulkRole] = useState<StaffRole>('Staff');
  const [importResult, setImportResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Add single staff form
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', role: 'Staff' as StaffRole });
  const [addingStaff, setAddingStaff] = useState(false);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── File Handling ──────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        showToast('error', 'No valid rows found. Ensure CSV has name, email, phone, role columns.');
        return;
      }
      setParsedRows(rows);
      setSelectedRows(new Set(rows.map((_, i) => i).filter(i => rows[i].valid)));
      setImportResult(null);
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file);
    }
  };

  // ─── Row Selection ──────────────────────────────────────────────────────────
  const toggleRow = (idx: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    const validIdxs = parsedRows.map((_, i) => i).filter(i => parsedRows[i].valid);
    setSelectedRows(prev => prev.size === validIdxs.length ? new Set() : new Set(validIdxs));
  };

  // ─── Bulk Role Assignment ───────────────────────────────────────────────────
  const applyBulkRole = () => {
    setParsedRows(prev => prev.map((row, i) =>
      selectedRows.has(i) ? { ...row, role: bulkRole } : row
    ));
  };

  // ─── Batch Insert ───────────────────────────────────────────────────────────
  const handleBatchInsert = async () => {
    const toInsert = parsedRows
      .filter((_, i) => selectedRows.has(i))
      .filter(r => r.valid)
      .map(r => ({
        shop_id: shopId,
        name: r.name,
        email: r.email,
        phone: r.phone,
        role: r.role,
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d570eb07-1772731577599.png',
        avatar_alt: `${r.name} staff avatar`,
        status: 'Active' as const,
      }));

    if (toInsert.length === 0) {
      showToast('error', 'No valid rows selected for import.');
      return;
    }

    const result = await batchInsertStaff(toInsert);
    setImportResult(result);

    if (result.inserted > 0) {
      showToast('success', `Successfully imported ${result.inserted} staff member(s) to ${shopName}.`);
      refetch();
    }
    if (result.errors.length > 0) {
      showToast('error', `${result.errors.length} batch(es) failed. Check details below.`);
    }
  };

  // ─── Add Single Staff ───────────────────────────────────────────────────────
  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    if (!newStaff.name.trim()) errs.name = 'Name is required';
    if (!newStaff.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStaff.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleAddSingle = async () => {
    const errs = validateAddForm();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    setAddErrors({});
    setAddingStaff(true);
    try {
      await shopStaffApi.create(shopId, {
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        phone: newStaff.phone.trim(),
        role: newStaff.role.toUpperCase(),
      });
      showToast('success', `${newStaff.name} added to ${shopName}.`);
      setNewStaff({ name: '', email: '', phone: '', role: 'Staff' });
      setActiveTab('list');
      refetch();
    } finally {
      setAddingStaff(false);
    }
  };

  const handleRemove = async (staffId: string, staffName: string) => {
    const ok = await removeStaffMember(staffId);
    if (ok) showToast('success', `${staffName} removed from ${shopName}.`);
    else showToast('error', 'Failed to remove staff member.');
  };

  const handleRoleChange = async (staffId: string, role: DbStaff['role']) => {
    const ok = await updateStaffRole(staffId, role);
    if (!ok) showToast('error', 'Failed to update role.');
  };

  const validCount = parsedRows.filter(r => r.valid).length;
  const invalidCount = parsedRows.filter(r => !r.valid).length;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-foreground text-lg">Staff Management</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{shopName} · {staff.length} members</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-all">
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {([
            { key: 'list', label: 'Staff List', icon: 'UserGroupIcon' },
            { key: 'import', label: 'Import CSV/Excel', icon: 'ArrowUpTrayIcon' },
            { key: 'add', label: 'Add Member', icon: 'UserPlusIcon' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold shrink-0 ${
            toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <Icon name={toast.type === 'success' ? 'CheckCircleIcon' : 'ExclamationCircleIcon'} size={16} />
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-auto"><Icon name="XMarkIcon" size={14} /></button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Staff List Tab ── */}
          {activeTab === 'list' && (
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Icon name="UserGroupIcon" size={40} className="text-border mb-4" />
                  <p className="font-bold text-foreground mb-1">No staff members yet</p>
                  <p className="text-sm text-muted-foreground">Use Import or Add Member to onboard your team</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {staff.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-all">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Icon name="UserIcon" size={16} className="text-rose-deep" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${ROLE_COLORS[member.role]}`}>{member.role}</span>
                          {member.status === 'Inactive' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p>
                      </div>
                      {/* Role selector */}
                      <select
                        value={member.role}
                        onChange={e => handleRoleChange(member.id, e.target.value as DbStaff['role'])}
                        className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer"
                      >
                        {VALID_ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                      {member.role !== 'Owner' && (
                        <button
                          onClick={() => handleRemove(member.id, member.name)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <Icon name="TrashIcon" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Import Tab ── */}
          {activeTab === 'import' && (
            <div className="p-6 space-y-5">
              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
                <Icon name="ArrowUpTrayIcon" size={32} className={`mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-bold text-foreground text-sm mb-1">
                  {fileName ? fileName : 'Drop CSV/Excel file here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground">Supports .csv, .xlsx, .xls</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-xs text-muted-foreground">
                  <Icon name="InformationCircleIcon" size={13} />
                  Required columns: <span className="font-semibold text-foreground">name, email</span> · Optional: phone, role
                </div>
              </div>

              {/* Parsed Preview */}
              {parsedRows.length > 0 && (
                <>
                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{parsedRows.length} rows parsed</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{validCount} valid</span>
                    {invalidCount > 0 && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{invalidCount} invalid</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{selectedRows.size} selected</span>
                  </div>

                  {/* Bulk Role Assignment */}
                  <div className="flex items-center gap-3 p-4 bg-secondary/40 rounded-xl">
                    <Icon name="UserGroupIcon" size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground">Bulk assign role to selected:</span>
                    <select
                      value={bulkRole}
                      onChange={e => setBulkRole(e.target.value as StaffRole)}
                      className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none cursor-pointer"
                    >
                      {VALID_ROLES.filter(r => r !== 'Owner').map(r => <option key={r}>{r}</option>)}
                    </select>
                    <button
                      onClick={applyBulkRole}
                      disabled={selectedRows.size === 0}
                      className="px-3 py-1.5 bg-primary text-foreground text-xs font-bold rounded-lg hover:bg-rose-deep hover:text-white transition-all disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Row Table */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/50 border-b border-border">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === validCount && validCount > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-1">Name</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-40">Email</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">Role</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">Status</span>
                    </div>
                    <div className="divide-y divide-border max-h-56 overflow-y-auto">
                      {parsedRows.map((row, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-all ${
                            !row.valid ? 'bg-red-50/50' : selectedRows.has(idx) ? 'bg-primary/5' : 'hover:bg-secondary/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.has(idx)}
                            disabled={!row.valid}
                            onChange={() => toggleRow(idx)}
                            className="w-4 h-4 rounded accent-primary cursor-pointer disabled:opacity-40"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{row.name || '—'}</p>
                            {row.errors.length > 0 && (
                              <p className="text-[10px] text-red-500">{row.errors.join(', ')}</p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground w-40 truncate">{row.email || '—'}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg w-24 text-center ${ROLE_COLORS[row.role]}`}>{row.role}</span>
                          <div className="w-16 flex justify-center">
                            {row.valid
                              ? <Icon name="CheckCircleIcon" size={14} className="text-green-500" />
                              : <Icon name="ExclamationCircleIcon" size={14} className="text-red-500" />
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Import Result */}
                  {importResult && (
                    <div className={`p-4 rounded-xl border ${importResult.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <p className="text-sm font-bold text-foreground mb-1">
                        {importResult.inserted} member(s) imported successfully
                        {importResult.errors.length > 0 && ` · ${importResult.errors.length} batch error(s)`}
                      </p>
                      {importResult.errors.map((e, i) => (
                        <p key={i} className="text-xs text-red-600">{e}</p>
                      ))}
                    </div>
                  )}

                  {/* Action */}
                  <button
                    onClick={handleBatchInsert}
                    disabled={inserting || selectedRows.size === 0}
                    className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {inserting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Importing…</>
                    ) : (
                      <><Icon name="ArrowUpTrayIcon" size={16} />Import {selectedRows.size} Member(s) to {shopName}</>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Add Single Member Tab ── */}
          {activeTab === 'add' && (
            <div className="p-6">
              <div className="space-y-4 max-w-md">
                {([
                  { label: 'Full Name', key: 'name', placeholder: 'e.g. Jane Smith', type: 'text' },
                  { label: 'Email Address', key: 'email', placeholder: 'jane@shop.com', type: 'email' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+1 555-0000', type: 'tel' },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={newStaff[field.key]}
                      onChange={e => { setNewStaff(prev => ({ ...prev, [field.key]: e.target.value })); setAddErrors(prev => ({ ...prev, [field.key]: '' })); }}
                      className={`w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        addErrors[field.key] ? 'border-red-400 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    {addErrors[field.key] && <p className="text-xs text-red-500 mt-1">{addErrors[field.key]}</p>}
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                  <select
                    value={newStaff.role}
                    onChange={e => setNewStaff(prev => ({ ...prev, role: e.target.value as StaffRole }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    {VALID_ROLES.filter(r => r !== 'Owner').map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleAddSingle}
                  disabled={addingStaff}
                  className="w-full py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {addingStaff ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding…</>
                  ) : (
                    <><Icon name="UserPlusIcon" size={16} />Add to {shopName}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
