'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type PaymentResult = {
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
};

export default function PaymentResultPage() {
  const [status, setStatus] = useState<PaymentResult['status'] | 'loading' | 'error'>('loading');

  useEffect(() => {
    const loadResult = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get('paymentId');
      const token = params.get('token');
      if (!paymentId || !token) {
        setStatus('error');
        return;
      }
      try {
        const response = await fetch(`/api/mock-payments/${encodeURIComponent(paymentId)}?token=${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error('Payment lookup failed');
        const result = (await response.json()) as PaymentResult;
        setStatus(result.status);
        if (result.status === 'succeeded') {
          localStorage.removeItem('postdrop-draft');
          localStorage.removeItem('postdrop-letter-editor-draft');
          localStorage.removeItem('postdrop-pending-letter-id');
        }
      } catch {
        setStatus('error');
      }
    };
    void loadResult();
  }, []);

  const succeeded = status === 'succeeded';
  const waiting = status === 'loading';
  return (
    <main className="payment-page">
      <section className="payment-card payment-result-card" aria-live="polite">
        <div className="success-seal">P</div>
        <span className="eyebrow">POSTDROP</span>
        <h1>{waiting ? 'Đang xác nhận…' : succeeded ? 'Lá thư đã được niêm phong.' : 'Thanh toán chưa hoàn tất.'}</h1>
        <p>
          {waiting
            ? 'Vui lòng đợi trong giây lát.'
            : succeeded
              ? 'PostDrop sẽ gìn giữ lá thư và gửi đến đúng ngày bạn đã chọn.'
              : 'Bản nháp vẫn được giữ lại để bạn có thể thử thanh toán lần nữa.'}
        </p>
        {!waiting && (
          <div className="hero-actions">
            <a className="button button-primary" href={succeeded ? '/#/dashboard' : '/#/create/6'}>
              {succeeded ? 'Xem trong dashboard' : 'Quay lại thanh toán'}
            </a>
            <Link className="button button-secondary" href="/">Về trang chủ</Link>
          </div>
        )}
      </section>
    </main>
  );
}
