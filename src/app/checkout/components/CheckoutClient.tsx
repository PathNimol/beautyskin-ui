'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const ORDER_ITEMS = [
{ id: 1, name: 'Glow Essence Serum', brand: 'COSRX', price: 28.99, quantity: 2, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ffa882d-1773310521963.png', alt: 'Clear glass serum bottle with white dropper cap on soft pink background' },
{ id: 2, name: 'Hydra Barrier Cream', brand: 'Laneige', price: 34.00, quantity: 1, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e9fd727b-1772071563202.png', alt: 'White cream jar with minimalist label on marble surface' },
{ id: 3, name: 'UV Shield SPF 50+', brand: 'Skin1004', price: 19.99, quantity: 1, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_121d6c73f-1772074800330.png', alt: 'White sunscreen tube with minimal packaging on light cream background' }];


const COUNTRIES = ['United States', 'Cambodia', 'Thailand', 'Singapore', 'Malaysia', 'Vietnam', 'Philippines', 'Indonesia', 'Japan', 'South Korea'];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: 'card' | 'qr';
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  saveInfo: boolean;
}

export default function CheckoutClient() {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<'shipping' | 'payment'>('shipping');
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', country: 'United States',
    paymentMethod: 'card',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
    saveInfo: false
  });

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 0;
  const discount = subtotal * 0.10;
  const total = subtotal - discount + shipping;

  const orderNumber = `#ORD-${Math.floor(3000 + Math.random() * 1000)}`;

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirmed(true);
    }, 1500);
  };

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-card border border-border rounded-3xl shadow-card p-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircleIcon" size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-1">Thank you, {form.firstName || 'Customer'}!</p>
          <p className="text-muted-foreground text-sm mb-6">Your order has been placed successfully.</p>

          <div className="bg-secondary/60 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="font-bold text-foreground font-mono">{orderNumber}</p>
              </div>
              <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">Confirmed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Delivery to</p>
                <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                <p className="text-muted-foreground text-xs">{form.address || '123 Main St'}, {form.city || 'New York'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Estimated delivery</p>
                <p className="font-semibold text-foreground">3–5 business days</p>
                <p className="text-muted-foreground text-xs">Standard shipping</p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="space-y-3 mb-6">
            {ORDER_ITEMS.map((item) =>
            <div key={item.id} className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                  <AppImage src={item.image} alt={item.alt} width={48} height={48} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600">Promo (BEAUTY10)</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-border">
              <span>Total Paid</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-border transition-all text-sm text-center">
              Back to Home
            </Link>
            <Link href="/product-listing" className="flex-1 py-3 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose text-sm text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Checkout</span>
      </div>

      <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-8">Checkout</h1>

      {/* Step tabs */}
      <div className="flex items-center gap-4 mb-8">
        {(['shipping', 'payment'] as const).map((step, i) =>
        <React.Fragment key={step}>
            <button
            onClick={() => setActiveStep(step)}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${activeStep === step ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${activeStep === step ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className="capitalize hidden sm:block">{step}</span>
            </button>
            {i < 1 && <div className="flex-1 max-w-16 h-0.5 bg-border rounded-full" />}
          </React.Fragment>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {activeStep === 'shipping' &&
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                <Icon name="MapPinIcon" size={20} className="text-accent" />
                Shipping Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} placeholder="Emma" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} placeholder="Rodriguez" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="emma@example.com" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Street Address</label>
                  <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="123 Main Street, Apt 4B" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">City</label>
                  <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="New York" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">State / Province</label>
                  <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="NY" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">ZIP / Postal Code</label>
                  <input type="text" value={form.zip} onChange={(e) => updateForm('zip', e.target.value)} placeholder="10001" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Country</label>
                  <select value={form.country} onChange={(e) => updateForm('country', e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all cursor-pointer">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button
              onClick={() => setActiveStep('payment')}
              className="mt-6 w-full py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose flex items-center justify-center gap-2">
              
                Continue to Payment
                <Icon name="ArrowRightIcon" size={16} />
              </button>
            </div>
          }

          {activeStep === 'payment' &&
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-bold text-foreground text-lg mb-5 flex items-center gap-2">
                <Icon name="CreditCardIcon" size={20} className="text-accent" />
                Payment Method
              </h2>

              {/* Payment method tabs */}
              <div className="flex gap-3 mb-6">
                {([
              { value: 'card', label: 'Credit / Debit Card', icon: 'CreditCardIcon' },
              { value: 'qr', label: 'QR Payment', icon: 'QrCodeIcon' }] as
              const).map((method) =>
              <button
                key={method.value}
                onClick={() => updateForm('paymentMethod', method.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.paymentMethod === method.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                
                    <Icon name={method.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                    <span className="hidden sm:block">{method.label}</span>
                  </button>
              )}
              </div>

              {form.paymentMethod === 'card' &&
            <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Card Number</label>
                    <input
                  type="text"
                  value={form.cardNumber}
                  onChange={(e) => updateForm('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Cardholder Name</label>
                    <input type="text" value={form.cardName} onChange={(e) => updateForm('cardName', e.target.value)} placeholder="Emma Rodriguez" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Expiry Date</label>
                      <input
                    type="text"
                    value={form.expiry}
                    onChange={(e) => updateForm('expiry', formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">CVV</label>
                      <input type="text" value={form.cvv} onChange={(e) => updateForm('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" maxLength={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.saveInfo} onChange={(e) => updateForm('saveInfo', e.target.checked)} className="w-4 h-4 rounded border-border accent-rose-deep" />
                    <span className="text-sm text-muted-foreground">Save card for future purchases</span>
                  </label>
                </div>
            }

              {form.paymentMethod === 'qr' &&
            <div className="text-center py-6">
                  <div className="w-40 h-40 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                    <Icon name="QrCodeIcon" size={64} className="text-muted-foreground" />
                  </div>
                  <p className="font-bold text-foreground mb-1">Scan to Pay</p>
                  <p className="text-sm text-muted-foreground mb-2">Use your banking app to scan the QR code</p>
                  <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg px-4 py-2 inline-block">
                    Demo mode — QR payment simulation
                  </p>
                </div>
            }

              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveStep('shipping')} className="px-5 py-3.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-border transition-all text-sm flex items-center gap-2">
                  <Icon name="ArrowLeftIcon" size={16} />
                  Back
                </button>
                <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="flex-1 py-3.5 bg-primary text-foreground font-bold rounded-xl hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                
                  {loading ?
                <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Processing...
                    </> :

                <>
                      <Icon name="LockClosedIcon" size={16} />
                      Place Order · ${total.toFixed(2)}
                    </>
                }
                </button>
              </div>
            </div>
          }
        </div>

        {/* Order Summary sidebar */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card h-fit">
          <h3 className="font-bold text-foreground mb-5">Order Summary</h3>
          <div className="space-y-3 mb-5">
            {ORDER_ITEMS.map((item) =>
            <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary shrink-0 relative">
                  <AppImage src={item.image} alt={item.alt} width={48} height={48} className="object-cover w-full h-full" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-white text-[9px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.brand}</p>
                </div>
                <p className="text-sm font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            )}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Promo (BEAUTY10)</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>);

}