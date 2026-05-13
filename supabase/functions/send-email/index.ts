import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const body = await req.json();
    const { type, to, data } = body;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    let subject = "";
    let html = "";

    if (type === "order_confirmation") {
      subject = `Order Confirmed – ${data.orderRef}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
          <div style="background:linear-gradient(135deg,#e11d48,#f59e0b);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Order Confirmed! 🎉</h1>
          </div>
          <p style="color:#374151;">Hi <strong>${data.customerName}</strong>,</p>
          <p style="color:#374151;">Your order <strong>${data.orderRef}</strong> has been confirmed by <strong>${data.shopName}</strong>.</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            <h3 style="color:#111827;margin:0 0 12px;">Order Summary</h3>
            ${(data.items || []).map((item: { name: string; qty: number; price: number }) => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;">
                <span style="color:#374151;">${item.name} × ${item.qty}</span>
                <span style="color:#111827;font-weight:600;">$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join('')}
            <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-weight:700;font-size:16px;">
              <span>Total</span>
              <span style="color:#e11d48;">$${data.total}</span>
            </div>
          </div>
          <p style="color:#6b7280;font-size:14px;">You will receive updates as your order progresses. Thank you for shopping with BS Online Shop!</p>
        </div>`;
    } else if (type === "low_stock_alert") {
      subject = `⚠️ Low Stock Alert – ${data.productName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
          <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#92400e;margin:0;">⚠️ Low Stock Alert</h2>
          </div>
          <p style="color:#374151;">Hi <strong>${data.staffName}</strong>,</p>
          <p style="color:#374151;">The following product is running low on stock at <strong>${data.shopName}</strong>:</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>Product:</strong> ${data.productName}</p>
            <p style="margin:4px 0;"><strong>SKU:</strong> ${data.sku}</p>
            <p style="margin:4px 0;"><strong>Current Stock:</strong> <span style="color:#ef4444;font-weight:700;">${data.currentStock}</span></p>
            <p style="margin:4px 0;"><strong>Minimum Stock:</strong> ${data.minStock}</p>
          </div>
          <p style="color:#6b7280;font-size:14px;">Please restock this item as soon as possible to avoid stockouts.</p>
        </div>`;
    } else if (type === "receipt") {
      subject = `Receipt – ${data.receiptRef}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
          <div style="background:linear-gradient(135deg,#e11d48,#f59e0b);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Receipt – ${data.receiptRef}</h1>
          </div>
          <p style="color:#374151;">Hi <strong>${data.customerName}</strong>,</p>
          <p style="color:#374151;">Thank you for your purchase at <strong>${data.shopName}</strong>!</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            ${(data.items || []).map((item: { name: string; qty: number; price: number }) => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;">
                <span style="color:#374151;">${item.name} × ${item.qty}</span>
                <span style="color:#111827;font-weight:600;">$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join('')}
            <div style="padding:8px 0;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;">
              <span style="color:#6b7280;">Subtotal</span><span>$${data.subtotal}</span>
            </div>
            <div style="padding:8px 0;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;">
              <span style="color:#6b7280;">Tax</span><span>$${data.tax}</span>
            </div>
            <div style="padding:12px 0 0;display:flex;justify-content:space-between;font-weight:700;font-size:16px;">
              <span>Total</span><span style="color:#e11d48;">$${data.total}</span>
            </div>
          </div>
          <p style="color:#6b7280;font-size:14px;">Payment: ${data.paymentMethod}</p>
        </div>`;
    } else if (type === "chat_notification") {
      subject = `New message from ${data.senderName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;">
          <div style="background:#f3f4f6;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#111827;margin:0;">💬 New Message</h2>
          </div>
          <p style="color:#374151;">Hi <strong>${data.recipientName}</strong>,</p>
          <p style="color:#374151;">You have a new message from <strong>${data.senderName}</strong> (${data.senderRole}):</p>
          <div style="background:#f9fafb;border-left:4px solid #e11d48;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
            <p style="color:#374151;margin:0;font-style:italic;">"${data.message}"</p>
          </div>
          <p style="color:#6b7280;font-size:14px;">Log in to BS Online Shop to reply.</p>
        </div>`;
    } else {
      throw new Error(`Unknown email type: ${type}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
