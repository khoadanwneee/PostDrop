'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CheckoutState = {
  paymentId: string;
  productCode: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string;
  returnUrl: string;
  notice: string;
  actions: Record<'complete' | 'fail' | 'cancel', { path: string }>;
};

function messageFrom(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: string | string[] }).message;
    return Array.isArray(message) ? message.join(', ') : message || fallback;
  }
  return fallback;
}

export default function CheckoutPage() {
  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState('');

  useEffect(() => {
    const loadCheckout = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get('paymentId');
      const token = params.get('token');
      if (!paymentId || !token) {
        setError('Liên kết thanh toán không hợp lệ.');
        return;
      }
      try {
        const response = await fetch(`/api/mock-payments/${encodeURIComponent(paymentId)}?token=${encodeURIComponent(token)}`);
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(messageFrom(body, 'Không thể tải thanh toán'));
        setCheckout(body as CheckoutState);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Không thể tải thanh toán');
      }
    };
    void loadCheckout();
  }, []);

  const submit = async (action: 'complete' | 'fail' | 'cancel') => {
    if (!checkout) return;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;
    setSubmitting(action);
    setError('');
    try {
      const response = await fetch(`${checkout.actions[action].path}?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(messageFrom(body, 'Không thể cập nhật thanh toán'));
      window.location.assign((body as CheckoutState).returnUrl || checkout.returnUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật thanh toán');
      setSubmitting('');
    }
  };

  return (
    <main className="payment-page">
      <section className="payment-card" aria-live="polite">
        <header className="payment-header">
          <Link className="payment-brand" href="/">PostDrop</Link>
          <span className="payment-kicker">THANH TOÁN THỬ NGHIỆM</span>
        </header>
        <h1>Xác nhận thanh toán</h1>
        {!checkout && !error && <p>Đang tải thông tin thanh toán…</p>}
        {error && <div className="payment-error">{error}</div>}
        {checkout && (
          <>
            <div className="payment-summary">
              <span>Gói dịch vụ</span>
              <strong>{checkout.productCode.replaceAll('_', ' ')}</strong>
              <span>Số tiền</span>
              <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: checkout.currency }).format(checkout.amount)}</strong>
              <span>Trạng thái</span>
              <strong>{checkout.status}</strong>
            </div>
            <p className="payment-notice">{checkout.notice}</p>
            <button className="button button-primary payment-main-action" disabled={Boolean(submitting)} onClick={() => void submit('complete')}>
              {submitting === 'complete' ? 'Đang xử lý…' : 'Thanh toán và niêm phong'}
            </button>
            <div className="payment-secondary-actions">
              <button className="text-button" disabled={Boolean(submitting)} onClick={() => void submit('cancel')}>Hủy</button>
              <button className="text-button" disabled={Boolean(submitting)} onClick={() => void submit('fail')}>Mô phỏng thất bại</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
