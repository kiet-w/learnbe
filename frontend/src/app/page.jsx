'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardSummary, getTodayDashboardSummary } from '../lib/api/admin';
import { useToast } from '../contexts/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../components/templates/AppLayout';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const { showToast } = useToast();
  const router = useRouter();

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [summaryData, todayData] = await Promise.all([
        getDashboardSummary(),
        getTodayDashboardSummary(),
      ]);
      setSummary(summaryData);
      setTodaySummary(todayData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!isSilent) {
        showToast('Không thể tải dữ liệu tổng quan', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, fetchDashboardData]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex justify-center align-center h-full" style={{ minHeight: '400px' }}>
            <div className="loader"></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const successRate = todaySummary && todaySummary.ordersToday > 0
    ? Math.round((todaySummary.deliveredToday / todaySummary.ordersToday) * 100)
    : 0;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div>
          {/* Top Header Section */}
          <div className="flex justify-between align-center mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            <div>
              <h1 className="m-0 mb-xs" style={{ 
                fontSize: 'var(--text-3xl)', 
                fontWeight: '800', 
                background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary))', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                Bảng điều khiển Logistics
              </h1>
              <p className="text-secondary m-0" style={{ fontSize: 'var(--text-sm)' }}>
                Giám sát hoạt động kho bãi, đội ngũ giao nhận và tối ưu hóa vận hành thời gian thực.
              </p>
            </div>

            {/* Refresh controls */}
            <div className="flex align-center gap-md" style={{ 
              background: 'rgba(22, 27, 44, 0.6)', 
              backdropFilter: 'blur(8px)',
              padding: '6px 14px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div className="flex align-center gap-xs">
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: autoRefreshEnabled ? 'var(--status-success)' : 'var(--text-tertiary)',
                    boxShadow: autoRefreshEnabled ? '0 0 10px var(--status-success)' : 'none',
                    animation: autoRefreshEnabled ? 'pulse 2s infinite' : 'none',
                  }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {autoRefreshEnabled ? 'Live Sync' : 'Sync Offline'}
                </span>
              </div>

              <style>
                {`
                  @keyframes pulse {
                    0% { opacity: 0.3; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 0.3; transform: scale(0.9); }
                  }
                `}
              </style>

              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className="btn btn-secondary p-xs"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
              >
                {autoRefreshEnabled ? 'Tạm dừng' : 'Tự động'}
              </button>

              <button
                onClick={() => fetchDashboardData(true)}
                className="btn btn-primary p-xs"
                style={{ fontSize: '11px', padding: '4px 10px', minWidth: '60px', borderRadius: 'var(--radius-sm)' }}
                disabled={refreshing}
              >
                {refreshing ? '...' : 'Đồng bộ'}
              </button>

              {lastUpdated && (
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Grid: Today's Summary Metrics */}
          <h3 className="mb-md text-secondary" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hoạt động hôm nay (Today's Activity)
          </h3>
          <div className="grid grid-3 mb-xl" style={{ gap: 'var(--space-lg)' }}>
            <div
              className="card card-interactive cursor-pointer flex justify-between align-center"
              onClick={() => router.push('/delivery-orders')}
              style={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.02) 100%)',
                borderColor: 'rgba(99, 102, 241, 0.2)'
              }}
            >
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Đơn hàng mới nhận</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {todaySummary?.ordersToday || 0}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neon-indigo)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--neon-indigo)' }}></span>
                  Chờ điều phối xử lý
                </div>
              </div>
            </div>

            <div
              className="card card-interactive cursor-pointer flex justify-between align-center"
              onClick={() => router.push('/delivery-orders')}
              style={{ 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
                borderColor: 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Đã giao thành công</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: 'var(--status-success)', letterSpacing: '-0.03em' }}>
                  {todaySummary?.deliveredToday || 0}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }}></span>
                  Hiệu suất hoàn thành: {successRate}%
                </div>
              </div>
            </div>

            <div
              className="card card-interactive cursor-pointer flex justify-between align-center"
              onClick={() => router.push('/delivery-batches')}
              style={{ 
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.02) 100%)',
                borderColor: 'rgba(168, 85, 247, 0.2)'
              }}
            >
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Chuyến xe xuất phát</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: '#a78bfa', letterSpacing: '-0.03em' }}>
                  {todaySummary?.batchesToday || 0}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#c084fc' }}></span>
                  Lộ trình tối ưu Mapbox VRP
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Main KPI breakdown */}
          <h3 className="mb-md text-secondary" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Trạng thái tổng quát hệ thống (System Overview)
          </h3>
          <div className="grid grid-4 mb-xl" style={{ gap: 'var(--space-lg)' }}>
            <div className="card flex flex-col justify-between" style={{ minHeight: '190px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Tổng số đơn hàng</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', letterSpacing: '-0.02em' }}>{summary?.orders?.total || 0}</div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="flex justify-between" style={{ color: 'var(--badge-pending-text)' }}>
                  <span>Chờ xử lý:</span>
                  <strong>{summary?.orders?.pending || 0} đơn</strong>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--badge-transit-text)' }}>
                  <span>Đang giao:</span>
                  <strong>{summary?.orders?.inTransit || 0} đơn</strong>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--badge-delivered-text)' }}>
                  <span>Đã hoàn thành:</span>
                  <strong>{summary?.orders?.delivered || 0} đơn</strong>
                </div>
              </div>
            </div>

            <div className="card flex flex-col justify-between" style={{ minHeight: '190px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Chuyến xe gom đơn</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: 'var(--accent-secondary)', letterSpacing: '-0.02em' }}>
                  {summary?.batches?.total || 0}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--status-warning)' }}>
                    {summary?.batches?.active || 0}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    chuyến đang vận chuyển
                  </span>
                </div>
                <button
                  onClick={() => router.push('/delivery-batches')}
                  className="btn btn-secondary w-full p-xs"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Xem danh sách chuyến
                </button>
              </div>
            </div>

            <div className="card flex flex-col justify-between" style={{ minHeight: '190px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Shipper trực tuyến</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: 'var(--status-success)', letterSpacing: '-0.02em' }}>
                  {summary?.shippers?.available || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                  Nhân viên vận chuyển đang sẵn sàng tiếp nhận lộ trình giao hàng mới.
                </div>
                <button
                  onClick={() => router.push('/shippers')}
                  className="btn btn-secondary w-full p-xs"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Quản lý shipper
                </button>
              </div>
            </div>

            <div className="card flex flex-col justify-between" style={{ minHeight: '190px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Sản phẩm kinh doanh</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: '800', margin: '8px 0', color: 'var(--status-info)', letterSpacing: '-0.02em' }}>
                  {summary?.products?.total || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                  Tổng số mã danh mục sản phẩm (SKU) đang được khai thác vận hành.
                </div>
                <button
                  onClick={() => router.push('/reports/inventory')}
                  className="btn btn-secondary w-full p-xs"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Xem đối soát tồn kho
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Quick Links */}
          <h3 className="mb-md text-secondary" style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Lối tắt thao tác nhanh (Quick Actions)
          </h3>
          <div className="grid grid-4" style={{ gap: 'var(--space-lg)' }}>
            <div
              className="card card-interactive cursor-pointer text-center p-lg flex flex-col align-center justify-center gap-xs"
              onClick={() => router.push('/delivery-orders/new')}
              style={{ border: '1px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.02)' }}
            >

              <strong style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>Tạo Đơn Hàng Mới</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nhập thông tin & Geocode tọa độ</span>
            </div>

            <div
              className="card card-interactive cursor-pointer text-center p-lg flex flex-col align-center justify-center gap-xs"
              onClick={() => router.push('/delivery-batches')}
              style={{ border: '1px dashed rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.02)' }}
            >

              <strong style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>Ghép Chuyến & Tối Ưu</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tập hợp đơn và chạy Mapbox TSP</span>
            </div>

            <div
              className="card card-interactive cursor-pointer text-center p-lg flex flex-col align-center justify-center gap-xs"
              onClick={() => router.push('/reports/shippers')}
              style={{ border: '1px dashed rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.02)' }}
            >

              <strong style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>Hiệu Suất Shipper</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Thời gian và quãng đường hoàn thành</span>
            </div>

            <div
              className="card card-interactive cursor-pointer text-center p-lg flex flex-col align-center justify-center gap-xs"
              onClick={() => router.push('/reports/inventory')}
              style={{ border: '1px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.02)' }}
            >

              <strong style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>Báo Cáo Tồn Kho</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Thống kê nhập xuất tồn từng kho</span>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
