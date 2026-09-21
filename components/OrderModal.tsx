"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    customer_name?: string;
    phone?: string;
    city?: string;
    address?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset errors when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formattedSubtotal = `₹${subtotal.toLocaleString('en-IN')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // 1. Full Name: min 2 chars
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = "Name is required";
    }

    // 2. Phone Number: 10-digit Indian mobile /^[6-9]\d{9}$/
    const cleanedPhone = formData.phone.trim().replace(/^(\+91[\s-]?|0)/, '').replace(/[\s-]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    // 3. City / State: min 2 chars
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = "City / State is required";
    }

    // 4. Address: min 10 chars
    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = "Please enter a delivery address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error field automatically
      if (newErrors.customer_name) {
        nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameRef.current?.focus();
      } else if (newErrors.phone) {
        phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneRef.current?.focus();
      } else if (newErrors.city) {
        cityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cityRef.current?.focus();
      } else if (newErrors.address) {
        addressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addressRef.current?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        company_name: formData.company_name.trim() || undefined,
        phone: cleanedPhone,
        address: formData.address.trim(),
        city: formData.city.trim(),
        notes: formData.notes.trim() || undefined,
        items,
        subtotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to place order');
      }

      // Build WhatsApp message
      const itemsList = items.map(item => `- ${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`).join('\n');
      const message = `*New Order — Anabia*\nCustomer: ${formData.customer_name.trim()}\nPhone: ${cleanedPhone}\nCompany: ${formData.company_name.trim() || 'N/A'}\nDelivery Address: ${formData.address.trim()}\nCity / State: ${formData.city.trim()}\n\n*Items:*\n${itemsList}\n\n*Subtotal: ₹${subtotal.toLocaleString('en-IN')}*\n\nNotes: ${formData.notes.trim() || 'None'}`;

      const whatsappNumber = process.env.NEXT_PUBLIC_CLIENT_WHATSAPP;
      if (whatsappNumber) {
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }

      toast.success("Order placed! We'll contact you within 24 hours.");
      clearCart();
      onClose();
    } catch (error: unknown) {
      console.error("Order placement error:", error);
      const msg = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--surface)] border border-[var(--line)] p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)]"
          title="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-serif text-[24px] text-[var(--ink)] mb-6">Place your order</h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Full Name *</label>
              <input 
                ref={nameRef}
                type="text" 
                className={`w-full h-12 bg-[var(--surface)] border ${errors.customer_name ? 'border-[#C0392B]' : 'border-[var(--line)]'} px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none`}
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
              {errors.customer_name && (
                <p className="text-[#C0392B] text-[12px] font-sans mt-1.5">{errors.customer_name}</p>
              )}
            </div>
            
            {/* Company Name */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Company Name</label>
              <input 
                type="text" 
                className="w-full h-12 bg-[var(--surface)] border border-[var(--line)] px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Phone Number *</label>
              <input 
                ref={phoneRef}
                type="tel" 
                placeholder="9876543210"
                className={`w-full h-12 bg-[var(--surface)] border ${errors.phone ? 'border-[#C0392B]' : 'border-[var(--line)]'} px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none`}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {errors.phone && (
                <p className="text-[#C0392B] text-[12px] font-sans mt-1.5">{errors.phone}</p>
              )}
            </div>

            {/* City / State */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">City / State *</label>
              <input 
                ref={cityRef}
                type="text" 
                className={`w-full h-12 bg-[var(--surface)] border ${errors.city ? 'border-[#C0392B]' : 'border-[var(--line)]'} px-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none`}
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
              {errors.city && (
                <p className="text-[#C0392B] text-[12px] font-sans mt-1.5">{errors.city}</p>
              )}
            </div>

            {/* Delivery Address (Mandatory) */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">DELIVERY ADDRESS *</label>
              <textarea 
                ref={addressRef}
                rows={3}
                placeholder="Street, Area, Landmark"
                className={`w-full bg-[var(--surface)] border ${errors.address ? 'border-[#C0392B]' : 'border-[var(--line)]'} p-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none resize-none`}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              {errors.address && (
                <p className="text-[#C0392B] text-[12px] font-sans mt-1.5">{errors.address}</p>
              )}
            </div>

            {/* Notes / Special Instructions */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5 block">Notes / Special instructions</label>
              <textarea 
                rows={3}
                className="w-full bg-[var(--surface)] border border-[var(--line)] p-4 text-[13px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--ink)] rounded-none resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-6">
            <h3 className="text-[11px] uppercase tracking-wider text-[var(--muted)] mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-[13px] text-[var(--ink)]">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-[var(--muted)] ml-2">× {item.quantity}</span>
                  </div>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--line)]">
              <span className="text-[14px] font-medium text-[var(--ink)]">Subtotal</span>
              <span className="text-[14px] font-medium text-[var(--ink)]">{formattedSubtotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[var(--accent)] text-[var(--surface)] text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-50 active:scale-[0.98] select-none"
          >
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
