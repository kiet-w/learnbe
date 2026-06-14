'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  // Simple path to breadcrumb translation
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length === 0) return <span>Dashboard</span>;

    return (
      <div className="flex align-center gap-xs" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        <Link href="/" style={{ color: 'var(--accent-primary)' }}>Trang chủ</Link>
        {paths.map((path, idx) => {
          const to = `/${paths.slice(0, idx + 1).join('/')}`;
          let label = path;
          if (path === 'inventory') label = 'Kho';
          else if (path === 'transactions') label = 'Giao dịch';
          else if (path === 'delivery-orders') label = 'Đơn hàng';
          else if (path === 'delivery-batches') label = 'Đơn ghép';
          else if (path === 'reports') label = 'Báo cáo';
          else if (path === 'products') label = 'Sản phẩm';
          else if (path === 'warehouses') label = 'Nhà kho';
          else if (path === 'shippers') label = 'Shipper';
          else if (path === 'stock') label = 'Tồn kho';
          else if (path === 'new') label = 'Tạo mới';
          
          const isLast = idx === paths.length - 1;

          return (
            <React.Fragment key={to}>
              <span>/</span>
              {isLast ? (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
              ) : (
                <Link href={to} style={{ color: 'var(--accent-primary)' }}>{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="header">
      <div>{getBreadcrumbs()}</div>
      <div className="flex align-center gap-md">
        <div className="flex align-center gap-sm" style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid var(--border-primary)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '11px',
            color: 'var(--text-primary)',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
          }}>
            {user?.role?.substring(0, 1) || 'U'}
          </div>
          <div className="flex-col" style={{ gap: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>ID: #{user?.id}</span>
            <span className="badge badge-assigned" style={{ fontSize: '8px', padding: '2px 6px', border: 'none', height: 'auto', lineHeight: 1 }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
