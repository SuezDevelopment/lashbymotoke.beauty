import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

interface CategoryItem { _id?: string; name: string; slug: string; description?: string; updatedAt?: string; }
interface ServiceItemForm { id?: string; name: string; slug: string; summary?: string; priceAmount?: number; priceCurrency?: 'NGN'|'USD'; durationMin?: number; durationUnit?: 'minute'|'hour'; tagsCsv?: string; position?: number; bookingLink?: string; highlights?: string[]; faqs?: Array<{ q: string; a: string }>; }
interface VariantForm { id?: string; name: string; slug: string; priceAmount?: number; priceCurrency?: 'NGN'|'USD'; durationMin?: number; durationUnit?: 'minute'|'hour'; tagsCsv?: string; imagesCsv?: string; bookingLink?: string; position?: number; }

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('services:read')) return { redirect: { destination: '/admin', permanent: false } };
  const canWrite = permissions.includes('services:write');
  return { props: { canWrite } };
};

const AdminServicesPage: NextPage<{ canWrite: boolean }> = ({ canWrite }) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState<CategoryItem>({ name: '', slug: '', description: '' });
  const [seeding, setSeeding] = useState(false);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [editingServiceItem, setEditingServiceItem] = useState<ServiceItemForm | null>(null);
  const [serviceItemForm, setServiceItemForm] = useState<ServiceItemForm>({ name: '', slug: '', summary: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', position: undefined, bookingLink: '', highlights: [], faqs: [] });
  const [serviceItemSaving, setServiceItemSaving] = useState(false);
  // Variants state
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedItemForVariants, setSelectedItemForVariants] = useState<any | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [editingVariant, setEditingVariant] = useState<VariantForm | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>({ name: '', slug: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', imagesCsv: '', bookingLink: '', position: undefined });
  const [variantSaving, setVariantSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success'|'error'|'info'; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const seedPresets = async () => {
    if (!canWrite) return;
    setSeeding(true);
    try {
      const presets: CategoryItem[] = [
        { name: 'Professional Lash Extensions & Brow', slug: 'lash-brow', description: 'Classic, volume lash extensions, microblading, brow carving, tinting.' },
        { name: 'Comprehensive Trainings (Internship)', slug: 'trainings-internship', description: 'Hands-on internship covering studio operations and beauty crafts.' },
        { name: 'Manicure & Pedicure', slug: 'manicure-pedicure', description: 'Professional manicure and pedicure services for clean, polished hands and feet.' },
        { name: 'Teeth Whitening', slug: 'teeth-whitening', description: 'Cosmetic teeth whitening service for a brighter smile.' },
      ];
      const existingSlugs = new Set(items.map(i => i.slug));
      for (const p of presets) {
        if (existingSlugs.has(p.slug)) continue;
        await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
      }
      await load();
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = () => { if (!canWrite) return; setEditing(null); setForm({ name: '', slug: '', description: '' }); setModalOpen(true); };
  const openEdit = (u: CategoryItem) => { if (!canWrite) return; setEditing(u); setForm({ name: u.name, slug: u.slug, description: u.description }); setModalOpen(true); };
  const saveForm = async () => {
    if (!canWrite) return;
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/services?id=${editing._id}` : '/api/admin/services';
    const payload: any = editing ? { name: form.name, slug: form.slug, description: form.description } : form;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) { setModalOpen(false); setEditing(null); await load(); }
  };
  const deleteItem = async (id?: string) => {
    if (!canWrite) return;
    if (!id) return;
    if (!confirm('Delete this service?')) return;
    const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) await load();
  };

  const manageItems = async (cat: CategoryItem) => {
    setSelectedCategory(cat);
    setItemsModalOpen(true);
    setItemsLoading(true);
    try {
      const res = await fetch(`/api/admin/serviceItems?categoryId=${cat._id}`);
      const data = await res.json();
      const arr = Array.isArray(data.items) ? data.items : [];
      // sort by position if available
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setServiceItems(arr);
    } finally {
      setItemsLoading(false);
    }
  };

  const openCreateServiceItem = () => {
    setEditingServiceItem(null);
    setServiceItemForm({ name: '', slug: '', summary: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', position: undefined, bookingLink: '', highlights: [], faqs: [] });
  };

  const manageVariants = async (item: any) => {
    if (!selectedCategory) return;
    setSelectedItemForVariants(item);
    setVariantsModalOpen(true);
    setVariantsLoading(true);
    try {
      const res = await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${item.id}`);
      const data = await res.json();
      const arr = Array.isArray(data.items) ? data.items : [];
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setVariants(arr);
    } finally {
      setVariantsLoading(false);
    }
  };

  const openCreateVariant = () => {
    setEditingVariant(null);
    setVariantForm({ name: '', slug: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', imagesCsv: '', bookingLink: '', position: undefined });
  };

  const openEditVariant = (v: any) => {
    setEditingVariant({
      id: v.id,
      name: v.name,
      slug: v.slug,
      priceAmount: v.basePrice?.amount,
      priceCurrency: v.basePrice?.currency || 'NGN',
      durationMin: v.duration?.min,
      durationUnit: v.duration?.unit || 'minute',
      tagsCsv: Array.isArray(v.tags) ? v.tags.join(', ') : '',
      imagesCsv: Array.isArray(v.images) ? v.images.join(', ') : '',
      bookingLink: v.bookingLink || '',
      position: typeof v.position === 'number' ? v.position : undefined,
    });
    setVariantForm({
      id: v.id,
      name: v.name,
      slug: v.slug,
      priceAmount: v.basePrice?.amount,
      priceCurrency: v.basePrice?.currency || 'NGN',
      durationMin: v.duration?.min,
      durationUnit: v.duration?.unit || 'minute',
      tagsCsv: Array.isArray(v.tags) ? v.tags.join(', ') : '',
      imagesCsv: Array.isArray(v.images) ? v.images.join(', ') : '',
      bookingLink: v.bookingLink || '',
      position: typeof v.position === 'number' ? v.position : undefined,
    });
  };

  const saveVariant = async () => {
    if (!selectedCategory || !selectedItemForVariants) return;
    if (!canWrite) return;
    if (!variantForm.name?.trim()) { setToast({ type: 'error', message: 'Variant name is required' }); return; }
    if (!variantForm.slug?.trim()) { setToast({ type: 'error', message: 'Variant slug is required' }); return; }
    const slugExists = variants.some(v => v.slug === variantForm.slug && v.id !== editingVariant?.id);
    if (slugExists) { setToast({ type: 'error', message: 'Variant slug must be unique within the item' }); return; }

    const payload: any = {
      name: variantForm.name,
      slug: variantForm.slug,
      basePrice: variantForm.priceAmount ? { amount: Number(variantForm.priceAmount), currency: variantForm.priceCurrency } : undefined,
      duration: variantForm.durationMin ? { min: Number(variantForm.durationMin), unit: variantForm.durationUnit } : undefined,
      tags: variantForm.tagsCsv ? variantForm.tagsCsv.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      images: variantForm.imagesCsv ? variantForm.imagesCsv.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      bookingLink: variantForm.bookingLink || undefined,
      position: (() => {
        const current = variants.length;
        if (editingVariant?.id) {
          const existing = variants.find(v => v.id === editingVariant.id);
          const fallback = typeof existing?.position === 'number' ? existing.position : current;
          return typeof variantForm.position === 'number' ? variantForm.position : fallback;
        }
        return typeof variantForm.position === 'number' ? variantForm.position : current;
      })(),
    };

    const method = editingVariant?.id ? 'PUT' : 'POST';
    const url = editingVariant?.id
      ? `/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${selectedItemForVariants.id}&variantId=${editingVariant.id}`
      : `/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${selectedItemForVariants.id}`;
    setVariantSaving(true);
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) {
      const r = await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${selectedItemForVariants.id}`);
      const d = await r.json();
      const arr = Array.isArray(d.items) ? d.items : [];
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setVariants(arr);
      setEditingVariant(null);
      setVariantForm({ name: '', slug: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', imagesCsv: '', bookingLink: '', position: undefined });
      setToast({ type: 'success', message: editingVariant?.id ? 'Variant updated' : 'Variant added' });
    } else {
      setToast({ type: 'error', message: data?.message || 'Failed to save variant' });
    }
    setVariantSaving(false);
  };

  const deleteVariant = async (id: string) => {
    if (!selectedCategory || !selectedItemForVariants) return;
    if (!canWrite) return;
    const res = await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${selectedItemForVariants.id}&variantId=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) {
      const r = await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory._id}&itemId=${selectedItemForVariants.id}`);
      const d = await r.json();
      const arr = Array.isArray(d.items) ? d.items : [];
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setVariants(arr);
      setToast({ type: 'success', message: 'Variant deleted' });
    } else {
      setToast({ type: 'error', message: data?.message || 'Failed to delete variant' });
    }
  };

  const reorderVariant = async (id: string, dir: 'up'|'down') => {
    const idx = variants.findIndex(v => v.id === id);
    if (idx === -1) return;
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= variants.length) return;
    // swap positions
    const a = variants[idx];
    const b = variants[swapWith];
    const newPosA = b.position ?? swapWith;
    const newPosB = a.position ?? idx;
    await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory!._id}&itemId=${selectedItemForVariants!.id}&variantId=${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: newPosA }) });
    await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory!._id}&itemId=${selectedItemForVariants!.id}&variantId=${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: newPosB }) });
    const r = await fetch(`/api/admin/serviceItemVariants?categoryId=${selectedCategory!._id}&itemId=${selectedItemForVariants!.id}`);
    const d = await r.json();
    const arr = Array.isArray(d.items) ? d.items : [];
    arr.sort((x: any, y: any) => (x.position ?? 0) - (y.position ?? 0));
    setVariants(arr);
  };

  const openEditServiceItem = (si: any) => {
    setEditingServiceItem({
      id: si.id,
      name: si.name,
      slug: si.slug,
      summary: si.summary || '',
      priceAmount: si.basePrice?.amount,
      priceCurrency: si.basePrice?.currency || 'NGN',
      durationMin: si.duration?.min,
      durationUnit: si.duration?.unit || 'minute',
      tagsCsv: Array.isArray(si.tags) ? si.tags.join(',') : '',
      position: typeof si.position === 'number' ? si.position : undefined,
      bookingLink: si.bookingLink || '',
      highlights: Array.isArray(si.highlights) ? si.highlights : [],
      faqs: Array.isArray(si.faqs) ? si.faqs : [],
    });
  };

  const saveServiceItem = async () => {
    if (!selectedCategory) return;
    if (!canWrite) return;
    // validations
    if (!serviceItemForm.name?.trim()) { setToast({ type: 'error', message: 'Name is required' }); return; }
    if (!serviceItemForm.slug?.trim()) { setToast({ type: 'error', message: 'Slug is required' }); return; }
    const slugExists = serviceItems.some(si => si.slug === serviceItemForm.slug && si.id !== editingServiceItem?.id);
    if (slugExists) { setToast({ type: 'error', message: 'Slug must be unique within the category' }); return; }

    const payload: any = {
      name: serviceItemForm.name,
      slug: serviceItemForm.slug,
      summary: serviceItemForm.summary,
      basePrice: serviceItemForm.priceAmount ? { amount: Number(serviceItemForm.priceAmount), currency: serviceItemForm.priceCurrency } : undefined,
      duration: serviceItemForm.durationMin ? { min: Number(serviceItemForm.durationMin), unit: serviceItemForm.durationUnit } : undefined,
      tags: serviceItemForm.tagsCsv ? serviceItemForm.tagsCsv.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      bookingLink: serviceItemForm.bookingLink || undefined,
      highlights: Array.isArray(serviceItemForm.highlights) ? serviceItemForm.highlights.map(h => String(h).trim()).filter(Boolean) : undefined,
      faqs: Array.isArray(serviceItemForm.faqs) ? serviceItemForm.faqs.map(f => ({ q: String(f.q || '').trim(), a: String(f.a || '').trim() })).filter(f => f.q || f.a) : undefined,
      position: (() => {
        const current = serviceItems.length;
        if (editingServiceItem?.id) {
          const existing = serviceItems.find(si => si.id === editingServiceItem.id);
          const fallback = typeof existing?.position === 'number' ? existing.position : current;
          return typeof serviceItemForm.position === 'number' ? serviceItemForm.position : fallback;
        }
        return typeof serviceItemForm.position === 'number' ? serviceItemForm.position : current;
      })(),
    };
    const method = editingServiceItem?.id ? 'PUT' : 'POST';
    const url = editingServiceItem?.id
      ? `/api/admin/serviceItems?categoryId=${selectedCategory._id}&itemId=${editingServiceItem.id}`
      : `/api/admin/serviceItems?categoryId=${selectedCategory._id}`;
    setServiceItemSaving(true);
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) {
      // Reload items
      const r = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}`);
      const d = await r.json();
      const arr = Array.isArray(d.items) ? d.items : [];
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setServiceItems(arr);
      setEditingServiceItem(null);
      setServiceItemForm({ name: '', slug: '', summary: '', priceAmount: undefined, priceCurrency: 'NGN', durationMin: undefined, durationUnit: 'minute', tagsCsv: '', position: undefined, bookingLink: '', highlights: [], faqs: [] });
      setToast({ type: 'success', message: editingServiceItem?.id ? 'Item updated' : 'Item added' });
    } else {
      setToast({ type: 'error', message: data?.message || 'Failed to save item' });
    }
    setServiceItemSaving(false);
  };

  const deleteServiceItem = async (id?: string) => {
    if (!selectedCategory || !id) return;
    if (!canWrite) return;
    if (!confirm('Delete this service item?')) return;
    const res = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}&itemId=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) {
      const r = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}`);
      const d = await r.json();
      const arr = Array.isArray(d.items) ? d.items : [];
      arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
      setServiceItems(arr);
      setToast({ type: 'success', message: 'Item deleted' });
    } else {
      setToast({ type: 'error', message: data?.message || 'Failed to delete item' });
    }
  };

  const slugify = (s: string) => s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const reorderServiceItem = async (id: string, direction: 'up' | 'down') => {
    if (!selectedCategory || !canWrite) return;
    const arr = [...serviceItems].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
    const idx = arr.findIndex(si => si.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    const a = arr[idx];
    const b = arr[swapIdx];
    const newPosA = b.position ?? swapIdx;
    const newPosB = a.position ?? idx;
    // Persist both updates
    const r1 = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}&itemId=${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: newPosA }) });
    const r2 = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}&itemId=${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: newPosB }) });
    const d1 = await r1.json(); const d2 = await r2.json();
    if (d1?.status && d2?.status) {
      const r = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}`);
      const d = await r.json();
      const arr2 = Array.isArray(d.items) ? d.items : [];
      arr2.sort((x: any, y: any) => (x.position ?? 0) - (y.position ?? 0));
      setServiceItems(arr2);
      setToast({ type: 'success', message: `Moved ${direction}` });
    } else {
      setToast({ type: 'error', message: 'Failed to reorder items' });
    }
  };

  const addPresetItems = async () => {
    if (!selectedCategory || !canWrite) return;
    const slug = selectedCategory.slug;
    const presets: Record<string, Array<{ name: string; slug: string; priceAmount?: number; durationMin?: number; tags?: string[] }>> = {
      'lash-brow': [
        { name: 'Classic Lash Extension', slug: 'classic-lash', priceAmount: 15000, durationMin: 90, tags: ['classic','natural'] },
        { name: 'Hybrid Lash Extension', slug: 'hybrid-lash', priceAmount: 18000, durationMin: 90, tags: ['hybrid','voluminous'] },
        { name: 'Volume Lash Extension', slug: 'volume-lash', priceAmount: 20000, durationMin: 120, tags: ['volume','dramatic'] },
        { name: 'Microblading', slug: 'microblading', priceAmount: 25000, durationMin: 120, tags: ['brow','microblading'] },
      ],
      'manicure-pedicure': [
        { name: 'Manicure', slug: 'manicure', priceAmount: 8000, durationMin: 60, tags: ['nails','hands'] },
        { name: 'Pedicure', slug: 'pedicure', priceAmount: 10000, durationMin: 60, tags: ['nails','feet'] },
      ],
      'teeth-whitening': [
        { name: 'Teeth Whitening', slug: 'teeth-whitening-basic', priceAmount: 30000, durationMin: 90, tags: ['smile','cosmetic'] },
      ],
    };
    const list = presets[slug] || [];
    if (list.length === 0) { setToast({ type: 'info', message: 'No presets defined for this category' }); return; }
    const existing = new Set(serviceItems.map(si => si.slug));
    let created = 0;
    for (const p of list) {
      if (existing.has(p.slug)) continue;
      const payload: any = {
        name: p.name,
        slug: p.slug,
        basePrice: p.priceAmount ? { amount: p.priceAmount, currency: 'NGN' } : undefined,
        duration: p.durationMin ? { min: p.durationMin, unit: 'minute' } : undefined,
        tags: p.tags || undefined,
      };
      const res = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data?.status) created++;
    }
    // reload
    const r = await fetch(`/api/admin/serviceItems?categoryId=${selectedCategory._id}`);
    const d = await r.json();
    const arr = Array.isArray(d.items) ? d.items : [];
    arr.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
    setServiceItems(arr);
    setToast({ type: 'success', message: created > 0 ? `Added ${created} preset item(s)` : 'All preset items already exist' });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Services</h1>
          <div className="flex items-center gap-2">
            {canWrite && (
              <button onClick={seedPresets} disabled={seeding} className="px-4 py-2 rounded-full bg-black/10 hover:bg-black/20 text-black">
                {seeding ? 'Seeding…' : 'Add Preset Categories'}
              </button>
            )}
            {canWrite && <button onClick={openCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Create Service</button>}
          </div>
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Description</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-3" colSpan={5}>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-8 bg-black/5 rounded-xl" />
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && <tr><td className="p-3" colSpan={5}>No services found.</td></tr>}
              {items.map(u => (
                <tr key={u._id || u.slug} className="border-t border-black/10">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.slug}</td>
                  <td className="p-3">{u.description || '-'}</td>
                  <td className="p-3 text-xs">{u.updatedAt || ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => manageItems(u)} className="px-3 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Manage Items</button>
                      {canWrite && <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>}
                      {canWrite && <button onClick={() => deleteItem(u._id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>}
                    </div>
                  </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl max-w-[90%] md:max-w-[60%] w-full m-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Service' : 'Create Service'}</h2>
                <button onClick={() => setModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (unique)" className="rounded-xl border border-black/10 px-3 py-2" />
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={4} />
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-full bg-black/10">Cancel</button>
                <button onClick={saveForm} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Save</button>
              </div>
            </div>
          </div>
        )}

        {itemsModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setItemsModalOpen(false)} />
            <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl max-w-[95%] md:max-w-[70%] w-full m-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Service Items — {selectedCategory.name}</h2>
                <button onClick={() => setItemsModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="mb-4">
                {itemsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-12 bg-black/5 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/5">
                        <th className="p-3">Name</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3">Position</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Tags</th>
                        <th className="p-3"/>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceItems.length === 0 && <tr><td className="p-3" colSpan={6}>No items found.</td></tr>}
                      {serviceItems.map(si => (
                        <tr key={si.id} className="border-t border-black/10">
                          <td className="p-3">{si.name}</td>
                          <td className="p-3">{si.slug}</td>
                          <td className="p-3">{typeof si.position === 'number' ? si.position : '-'}</td>
                          <td className="p-3">{si.basePrice ? `${si.basePrice.amount} ${si.basePrice.currency}` : '-'}</td>
                          <td className="p-3">{si.duration ? `${si.duration.min} ${si.duration.unit}` : '-'}</td>
                          <td className="p-3">{Array.isArray(si.tags) ? si.tags.join(', ') : '-'}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {canWrite && <button onClick={() => reorderServiceItem(si.id, 'up')} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Up</button>}
                              {canWrite && <button onClick={() => reorderServiceItem(si.id, 'down')} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Down</button>}
                              <button onClick={() => manageVariants(si)} className="px-3 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Manage Variants</button>
                              <button onClick={() => openEditServiceItem(si)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>
                              {canWrite && <button onClick={() => deleteServiceItem(si.id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex items-center justify-between mb-3">
                {canWrite && <button onClick={addPresetItems} className="px-3 py-1 rounded-full bg-black/10 hover:bg-black/20">Add Preset Items</button>}
                {toast && (
                  <div className={`text-sm ${toast.type === 'error' ? 'text-red-600' : toast.type === 'success' ? 'text-green-600' : 'text-black/70'}`}>{toast.message}</div>
                )}
              </div>
              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold">{editingServiceItem?.id ? 'Edit Item' : 'Add New Item'}</h3>
                  <button onClick={openCreateServiceItem} className="px-3 py-1 rounded-full bg-black/10">Reset</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={serviceItemForm.name} onChange={e => setServiceItemForm({ ...serviceItemForm, name: e.target.value })} placeholder="Name" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input value={serviceItemForm.slug} onChange={e => setServiceItemForm({ ...serviceItemForm, slug: e.target.value })} onBlur={() => { if (!serviceItemForm.slug) setServiceItemForm({ ...serviceItemForm, slug: slugify(serviceItemForm.name || '') }); }} placeholder="Slug (unique)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input type="number" value={serviceItemForm.position ?? ''} onChange={e => setServiceItemForm({ ...serviceItemForm, position: e.target.value ? Number(e.target.value) : undefined })} placeholder="Position (order)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input type="number" value={serviceItemForm.priceAmount ?? ''} onChange={e => setServiceItemForm({ ...serviceItemForm, priceAmount: e.target.value ? Number(e.target.value) : undefined })} placeholder="Price (amount)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <select value={serviceItemForm.priceCurrency} onChange={e => setServiceItemForm({ ...serviceItemForm, priceCurrency: e.target.value as any })} className="rounded-xl border border-black/10 px-3 py-2">
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                  <input type="number" value={serviceItemForm.durationMin ?? ''} onChange={e => setServiceItemForm({ ...serviceItemForm, durationMin: e.target.value ? Number(e.target.value) : undefined })} placeholder="Duration (min)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <select value={serviceItemForm.durationUnit} onChange={e => setServiceItemForm({ ...serviceItemForm, durationUnit: e.target.value as any })} className="rounded-xl border border-black/10 px-3 py-2">
                    <option value="minute">minute</option>
                    <option value="hour">hour</option>
                  </select>
                  <textarea value={serviceItemForm.summary || ''} onChange={e => setServiceItemForm({ ...serviceItemForm, summary: e.target.value })} placeholder="Summary" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={3} />
                  <input value={serviceItemForm.tagsCsv || ''} onChange={e => setServiceItemForm({ ...serviceItemForm, tagsCsv: e.target.value })} placeholder="Tags (comma-separated)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
                  <input value={serviceItemForm.bookingLink || ''} onChange={e => setServiceItemForm({ ...serviceItemForm, bookingLink: e.target.value })} placeholder="Booking Link (optional)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
                </div>
                {/* Highlights */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold">Highlights</h4>
                    <button onClick={() => setServiceItemForm({ ...serviceItemForm, highlights: [...(serviceItemForm.highlights || []), ''] })} className="px-2 py-1 rounded-full bg-black/10">Add</button>
                  </div>
                  <div className="space-y-2">
                    {(serviceItemForm.highlights || []).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input value={h} onChange={e => {
                          const arr = [...(serviceItemForm.highlights || [])];
                          arr[idx] = e.target.value;
                          setServiceItemForm({ ...serviceItemForm, highlights: arr });
                        }} placeholder={`Highlight ${idx + 1}`} className="flex-1 rounded-xl border border-black/10 px-3 py-2" />
                        <button onClick={() => {
                          const arr = [...(serviceItemForm.highlights || [])];
                          arr.splice(idx, 1);
                          setServiceItemForm({ ...serviceItemForm, highlights: arr });
                        }} className="px-2 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Remove</button>
                      </div>
                    ))}
                    {(serviceItemForm.highlights || []).length === 0 && (
                      <div className="text-sm text-black/60">No highlights added yet.</div>
                    )}
                  </div>
                </div>
                {/* FAQs */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold">FAQs</h4>
                    <button onClick={() => setServiceItemForm({ ...serviceItemForm, faqs: [...(serviceItemForm.faqs || []), { q: '', a: '' }] })} className="px-2 py-1 rounded-full bg-black/10">Add</button>
                  </div>
                  <div className="space-y-2">
                    {(serviceItemForm.faqs || []).map((f, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input value={f.q} onChange={e => {
                          const arr = [...(serviceItemForm.faqs || [])];
                          arr[idx] = { ...arr[idx], q: e.target.value };
                          setServiceItemForm({ ...serviceItemForm, faqs: arr });
                        }} placeholder={`Question ${idx + 1}`} className="rounded-xl border border-black/10 px-3 py-2" />
                        <input value={f.a} onChange={e => {
                          const arr = [...(serviceItemForm.faqs || [])];
                          arr[idx] = { ...arr[idx], a: e.target.value };
                          setServiceItemForm({ ...serviceItemForm, faqs: arr });
                        }} placeholder="Answer" className="rounded-xl border border-black/10 px-3 py-2" />
                        <div className="md:col-span-2 text-right">
                          <button onClick={() => {
                            const arr = [...(serviceItemForm.faqs || [])];
                            arr.splice(idx, 1);
                            setServiceItemForm({ ...serviceItemForm, faqs: arr });
                          }} className="px-2 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Remove</button>
                        </div>
                      </div>
                    ))}
                    {(serviceItemForm.faqs || []).length === 0 && (
                      <div className="text-sm text-black/60">No FAQs added yet.</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button onClick={saveServiceItem} disabled={!canWrite || serviceItemSaving} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">{serviceItemSaving ? 'Saving…' : editingServiceItem?.id ? 'Save Changes' : 'Add Item'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {variantsModalOpen && selectedCategory && selectedItemForVariants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setVariantsModalOpen(false)} />
            <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl max-w-[95%] md:max-w-[70%] w-full m-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Variants — {selectedItemForVariants.name}</h2>
                <button onClick={() => setVariantsModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="mb-4">
                {variantsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-12 bg-black/5 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/5">
                        <th className="p-3">Name</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3">Position</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Tags</th>
                        <th className="p-3"/>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 && <tr><td className="p-3" colSpan={6}>No variants found.</td></tr>}
                      {variants.map(v => (
                        <tr key={v.id} className="border-t border-black/10">
                          <td className="p-3">{v.name}</td>
                          <td className="p-3">{v.slug}</td>
                          <td className="p-3">{typeof v.position === 'number' ? v.position : '-'}</td>
                          <td className="p-3">{v.basePrice ? `${v.basePrice.amount} ${v.basePrice.currency}` : '-'}</td>
                          <td className="p-3">{v.duration ? `${v.duration.min} ${v.duration.unit}` : '-'}</td>
                          <td className="p-3">{Array.isArray(v.tags) ? v.tags.join(', ') : '-'}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {canWrite && <button onClick={() => reorderVariant(v.id, 'up')} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Up</button>}
                              {canWrite && <button onClick={() => reorderVariant(v.id, 'down')} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black">Down</button>}
                              <button onClick={() => openEditVariant(v)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>
                              {canWrite && <button onClick={() => deleteVariant(v.id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex items-center justify-between mb-3">
                <button onClick={openCreateVariant} className="px-3 py-1 rounded-full bg-black/10">Reset</button>
                {toast && (
                  <div className={`text-sm ${toast.type === 'error' ? 'text-red-600' : toast.type === 'success' ? 'text-green-600' : 'text-black/70'}`}>{toast.message}</div>
                )}
              </div>
              <div className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold">{editingVariant?.id ? 'Edit Variant' : 'Add New Variant'}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} placeholder="Name" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input value={variantForm.slug} onChange={e => setVariantForm({ ...variantForm, slug: e.target.value })} placeholder="Slug (unique)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input type="number" value={variantForm.position ?? ''} onChange={e => setVariantForm({ ...variantForm, position: e.target.value ? Number(e.target.value) : undefined })} placeholder="Position (order)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <input type="number" value={variantForm.priceAmount ?? ''} onChange={e => setVariantForm({ ...variantForm, priceAmount: e.target.value ? Number(e.target.value) : undefined })} placeholder="Price (amount)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <select value={variantForm.priceCurrency} onChange={e => setVariantForm({ ...variantForm, priceCurrency: e.target.value as any })} className="rounded-xl border border-black/10 px-3 py-2">
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                  <input type="number" value={variantForm.durationMin ?? ''} onChange={e => setVariantForm({ ...variantForm, durationMin: e.target.value ? Number(e.target.value) : undefined })} placeholder="Duration (min)" className="rounded-xl border border-black/10 px-3 py-2" />
                  <select value={variantForm.durationUnit} onChange={e => setVariantForm({ ...variantForm, durationUnit: e.target.value as any })} className="rounded-xl border border-black/10 px-3 py-2">
                    <option value="minute">minute</option>
                    <option value="hour">hour</option>
                  </select>
                  <input value={variantForm.tagsCsv || ''} onChange={e => setVariantForm({ ...variantForm, tagsCsv: e.target.value })} placeholder="Tags (comma-separated)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
                  <input value={variantForm.imagesCsv || ''} onChange={e => setVariantForm({ ...variantForm, imagesCsv: e.target.value })} placeholder="Images URLs (comma-separated)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
                  <input value={variantForm.bookingLink || ''} onChange={e => setVariantForm({ ...variantForm, bookingLink: e.target.value })} placeholder="Booking Link (optional)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button onClick={saveVariant} disabled={!canWrite || variantSaving} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">{variantSaving ? 'Saving…' : editingVariant?.id ? 'Save Changes' : 'Add Variant'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServicesPage;