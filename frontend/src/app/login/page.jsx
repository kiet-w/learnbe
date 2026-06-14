'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { login as loginApi } from '../../lib/api/auth';
import { useToast } from '../../contexts/ToastContext';
import { FormField } from '../../components/molecules';
import { Button } from '../../components/atoms';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng điền đầy đủ email và mật khẩu', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(data.accessToken, data.refreshToken);
      showToast('Đăng nhập thành công', 'success');
      router.replace(from);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        type="email"
        placeholder="admin@store.vn"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      <FormField
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
      />

      <Button type="submit" className="w-full mt-md" disabled={loading}>
        {loading ? 'Đang xác thực...' : 'Đăng nhập'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex align-center justify-center" style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
      position: 'relative'
    }}>
      <div className="card" style={{ 
        width: '90%', 
        maxWidth: '420px', 
        padding: 'var(--space-xl)',
        background: 'rgba(13, 17, 28, 0.7)',
        backdropFilter: 'var(--glass-blur)',
        borderColor: 'var(--glass-border)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div className="text-center mb-xl">
          <h2 className="m-0 mb-xs" style={{ 
            background: 'var(--accent-gradient)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontWeight: '800', 
            fontSize: 'var(--text-3xl)',
            letterSpacing: '-0.03em'
          }}>
            Logistics Hub
          </h2>
          <p className="text-secondary m-0" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Hệ thống Quản lý và Điều phối
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Đang tải cấu hình...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
