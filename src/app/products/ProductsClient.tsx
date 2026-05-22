'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useShopProductManagement } from '@/hooks/useShopProductManagement';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',
  expiring_soon: 'bg-orange-50 text-orange-700 border-orange-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

const CATEGORIES = ['All', 'Serums', 'Moisturizers', 'Toners', 'Sunscreen', 'Masks', 'Eye Care'];

export default function ProductsClient() {
  const { user } = useMockAuth();
  const { products: dbProducts, loading } = useShopProductManagement(user?.shopId);
  const apiProducts = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    stock: p.stock,
    sold: p.sold,
    sku: p.sku,
    image: p.image,
    status: p.product_status,
  }));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = apiProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'stock') return a.stock - b.stock;
    if (sortBy === 'sold') return b.sold - a.sold;
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(prev => prev.length === paginated.length ? [] : paginated.map(p => p.id));
  };

  return (
    <>{/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, brands, SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all"
          >
            <option value="All">All Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-all"
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock</option>
            <option value="sold">Sort: Best Selling</option>
          </select>
          <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
            <button onClick={() => setViewMode('table')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-primary' : 'hover:bg-secondary'}`}>
              <Icon name="TableCellsIcon" size={15} className={viewMode === 'table' ? 'text-foreground' : 'text-muted-foreground'} />
            </button>
            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary' : 'hover:bg-secondary'}`}>
              <Icon name="Squares2X2Icon" size={15} className={viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground'} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose">
            <Icon name="PlusIcon" size={15} />
            Add Product
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              category === cat ? 'bg-primary text-foreground shadow-rose' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-xl mb-4">
          <span className="text-sm font-semibold text-foreground">{selectedIds.length} selected</span>
          <button className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">Delete</button>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Export</button>
          <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">SKU</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Category</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                          <Icon name="ArchiveBoxIcon" size={24} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(product => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0">
                          <AppImage src={product.image} alt={product.imageAlt} width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-snug max-w-[200px] truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div>
                        <span className="text-sm font-bold text-foreground">${product.price}</span>
                        {product.originalPrice && (
                          <p className="text-[10px] text-muted-foreground line-through">${product.originalPrice}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-amber-600' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_STYLES[product.status]}`}>
                        {STATUS_LABELS[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/product-detail/${product.id}`} className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
                          <Icon name="EyeIcon" size={13} className="text-muted-foreground" />
                        </Link>
                        <button className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all">
                          <Icon name="PencilIcon" size={13} className="text-muted-foreground" />
                        </button>
                        <button className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center hover:bg-red-50 transition-all">
                          <Icon name="TrashIcon" size={13} className="text-muted-foreground hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-primary/10 transition-all">
                  <Icon name="ChevronLeftIcon" size={14} className="text-muted-foreground" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground hover:bg-primary/10'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-primary/10 transition-all">
                  <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginated.map(product => (
            <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-rose transition-all group">
              <div className="relative h-44 overflow-hidden">
                <AppImage src={product.image} alt={product.imageAlt} width={300} height={176} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border ${STATUS_STYLES[product.status]}`}>
                    {STATUS_LABELS[product.status]}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{product.brand}</p>
                <p className="text-xs font-bold text-foreground mt-1 leading-snug line-clamp-2">{product.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-extrabold text-foreground">${product.price}</span>
                  <span className="text-[10px] text-muted-foreground">Stock: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
