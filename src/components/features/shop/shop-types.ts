export type ShopStatus = 'active' | 'pending' | 'suspended';

export const STATUS_COLORS: Record<ShopStatus, string> = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-red-700',
};

export const STATUS_LABELS: Record<ShopStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
};

export interface NewShopForm {
  name: string;
  owner_name: string;
  description: string;
  category: string;
  logo: string;
  status: 'active' | 'pending';
}

export async function uploadLogo(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Upload failed');
  }

  const data = await res.json();
  return data.url as string;
}
