'use client';

import { createClient } from '@/lib/supabase/client';

interface OrderConfirmationData {
  orderRef: string;
  customerName: string;
  shopName: string;
  items: { name: string; qty: number; price: number }[];
  total: string;
}

interface LowStockAlertData {
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  shopName: string;
  staffName: string;
}

interface ReceiptData {
  receiptRef: string;
  customerName: string;
  shopName: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: string;
  tax: string;
  total: string;
  paymentMethod: string;
}

interface ChatNotificationData {
  senderName: string;
  senderRole: string;
  recipientName: string;
  message: string;
}

async function invokeEmailFunction(type: string, to: string, data: Record<string, unknown>) {
  try {
    const supabase = createClient();
    const { error } = await supabase.functions.invoke('send-email', {
      body: { type, to, data },
    });
    if (error) console.error('Email send error:', error.message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Email invoke error:', message);
  }
}

export const emailService = {
  async sendOrderConfirmation(to: string, data: OrderConfirmationData) {
    await invokeEmailFunction('order_confirmation', to, data as unknown as Record<string, unknown>);
  },
  async sendLowStockAlert(to: string, data: LowStockAlertData) {
    await invokeEmailFunction('low_stock_alert', to, data as unknown as Record<string, unknown>);
  },
  async sendReceipt(to: string, data: ReceiptData) {
    await invokeEmailFunction('receipt', to, data as unknown as Record<string, unknown>);
  },
  async sendChatNotification(to: string, data: ChatNotificationData) {
    await invokeEmailFunction('chat_notification', to, data as unknown as Record<string, unknown>);
  },
};
