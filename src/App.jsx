import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Data Defaults
import { DEFAULT_SETTINGS, DEFAULT_BATCHES, DEFAULT_ORDERS, DEFAULT_EXPENSES } from './data/dummyData';

// Controllers Layer
import { fetchSettingsController, saveSettingsController } from './controllers/settingController';
import { fetchBatchesController, saveBatchesLocalController, saveBatchController, deleteBatchController } from './controllers/batchController';
import { fetchOrdersController, saveOrdersLocalController, saveOrderController, deleteOrderController } from './controllers/orderController';
import { fetchExpensesController, saveExpensesLocalController, saveExpenseController, deleteExpenseController } from './controllers/expenseController';
import { fetchSettlementsController, saveSettlementsLocalController, saveSettlementController } from './controllers/settlementController';
import { getMetricsController } from './controllers/metricsController';
import { getCurrentAuthUser, signIn, signOut, subscribeToAuthChanges } from './services/authService';

import { isSupabaseConfigured } from './utils/supabaseClient';
import { nextLocalOrderNumber } from './utils/orderNumber';

// Routes & Layout
import AppRoutes from './routes/AppRoutes';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/common/Toast';
import ThemeSwitcher from './components/common/ThemeSwitcher';

// Modals
import OrderModal from './components/modals/OrderModal';
import ExpenseModal from './components/modals/ExpenseModal';
import BatchModal from './components/modals/BatchModal';
import ScanReceiptModal from './components/modals/ScanReceiptModal';
import SettlementModal from './components/modals/SettlementModal';
import LoginView from './components/views/LoginView';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // State Initialization
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [batches, setBatchesState] = useState(DEFAULT_BATCHES);
  const [orders, setOrdersState] = useState(DEFAULT_ORDERS);
  const [expenses, setExpensesState] = useState(DEFAULT_EXPENSES);
  const [settlements, setSettlementsState] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const authUserId = authUser?.id;

  // Active Batch Filter
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-001');

  // Navigation Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [settlementPartner, setSettlementPartner] = useState(null);

  // Toast Notification banner
  const [toast, setToast] = useState(null);
  const deletePromptOpenRef = useRef(false);

  const confirmDelete = async (detail) => {
    if (deletePromptOpenRef.current) return false;
    deletePromptOpenRef.current = true;
    try {
      const dark = document.documentElement.dataset.theme === 'dark';
      const result = await Swal.fire({
        title: 'Apakah Anda yakin mau hapus data ini?',
        text: detail,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak',
        confirmButtonColor: '#be123c',
        cancelButtonColor: '#475569',
        background: dark ? '#172235' : '#ffffff',
        color: dark ? '#e2e8f0' : '#1e293b',
        reverseButtons: true,
        focusCancel: true,
        heightAuto: false,
      });
      return result.isConfirmed;
    } finally {
      deletePromptOpenRef.current = false;
    }
  };

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load Data via Controllers
  useEffect(() => {
    getCurrentAuthUser().then(setAuthUser).catch(error => setAuthError(error.message)).finally(() => setAuthLoading(false));
    return subscribeToAuthChanges(setAuthUser, error => setAuthError(error.message));
  }, []);

  useEffect(() => {
    if (!authUserId) { setIsDataLoaded(false); return; }
    let active = true;
    setIsDataLoaded(false);
    setLoadError('');
    async function initData() {
      try {
        const [st, bt, ord, exp, stl] = await Promise.all([
          fetchSettingsController(),
          fetchBatchesController(),
          fetchOrdersController(),
          fetchExpensesController(),
          fetchSettlementsController(),
        ]);
        if (!active) return;
        setSelectedBatchId(bt[0]?.id || 'ALL');
        setSettingsState(st);
        setBatchesState(bt);
        setOrdersState(ord);
        setExpensesState(exp);
        setSettlementsState(stl);
      } catch (err) {
        if (active) setLoadError(err.message || 'Gagal memuat database.');
      } finally {
        if (active) setIsDataLoaded(true);
      }
    }
    initData();
    return () => { active = false; };
  }, [authUserId]);

  // Update State & Storage Wrappers
  const setSettings = async (newSettings, logoFile) => {
    const savedSettings = await saveSettingsController(newSettings, logoFile);
    setSettingsState(savedSettings);
    return savedSettings;
  };

  const setBatches = (newBatches) => {
    setBatchesState(newBatches);
    saveBatchesLocalController(newBatches);
  };

  const setOrders = (newOrders) => {
    setOrdersState(newOrders);
    saveOrdersLocalController(newOrders);
  };

  const setExpenses = (newExpenses) => {
    setExpensesState(newExpenses);
    saveExpensesLocalController(newExpenses);
  };

  const setSettlements = (newSettlements) => {
    setSettlementsState(newSettlements);
    saveSettlementsLocalController(newSettlements);
  };

  // Filtered orders & expenses by selected Batch
  const filteredOrders = useMemo(() => {
    if (selectedBatchId === 'ALL') return orders;
    return orders.filter((o) => o.batchId === selectedBatchId);
  }, [orders, selectedBatchId]);

  const filteredExpenses = useMemo(() => {
    if (selectedBatchId === 'ALL') return expenses;
    return expenses.filter((e) => e.batchId === selectedBatchId);
  }, [expenses, selectedBatchId]);

  const filteredSettlements = useMemo(() => {
    if (selectedBatchId === 'ALL') return settlements;
    return settlements.filter((settlement) => settlement.batchId === selectedBatchId);
  }, [settlements, selectedBatchId]);

  // Financial Metrics Calculation via MetricsController
  const metrics = useMemo(() => {
    return getMetricsController(filteredOrders, filteredExpenses);
  }, [filteredOrders, filteredExpenses]);

  // Dynamic Header Title from Route URL
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard Overview & Keuangan';
    if (path === '/batches') return 'Manajemen Batch Trip';
    if (path === '/orders') return 'Rekapitulasi Semua Pesanan';
    if (path === '/shopping') return 'Checklist Belanja per Toko';
    if (path === '/expenses') return 'Pengeluaran Operasional Trip';
    if (path === '/settlement') return 'Bagi Hasil & Settlement Partner';
    if (path === '/receipt') return 'Cetak Struk / Nota Jastip';
    if (path === '/ai-tools') return 'Asisten & Intelligence Gemini AI';
    if (path === '/settings') return 'Pengaturan Identitas & Logo Toko';
    return 'singgahdulu.jastip';
  }, [location.pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      setAuthUser(null);
      setAuthError('');
      setShowOrderModal(false);
      setShowExpenseModal(false);
      setShowBatchModal(false);
      setShowScanModal(false);
      setSettlementPartner(null);
      setSidebarOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      triggerToast(error.message || 'Gagal logout. Silakan coba lagi.', 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-300 text-sm">Memuat sesi...</div>;
  if (!authUser && location.pathname !== '/login') return <Navigate to="/login" replace />;
  if (!authUser) return <LoginView initialError={authError} isSupabaseConfigured={isSupabaseConfigured} onLogin={async (username, password) => { const user = await signIn(username, password); setAuthUser(user); navigate('/'); }} />;

  if (location.pathname === '/login') return <Navigate to="/" replace />;
  if (loadError) return <main className="p-8"><p role="alert">Gagal memuat database: {loadError}</p><button onClick={() => window.location.reload()}>Coba lagi</button></main>;
  if (!isDataLoaded) return <main className="p-8">Memuat data...</main>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      <Toast toast={toast} />
      <ThemeSwitcher />

      {/* Mobile Top Header Bar */}
      <Header
        settings={settings}
        batches={batches}
        selectedBatchId={selectedBatchId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Sidebar Navigation with Router NavLinks */}
      <Sidebar
        settings={settings}
        batches={batches}
        selectedBatchId={selectedBatchId}
        setSelectedBatchId={setSelectedBatchId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        filteredOrdersCount={filteredOrders.length}
        currentUser={authUser}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {/* Main Content Container */}
      <main className="flex-1 min-w-0 md:ml-64 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Supabase Connection Banner */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-database text-amber-600 text-base"></i>
              <div>
                <strong>Database Supabase Belum Terhubung:</strong> Aplikasi saat ini menggunakan penyimpanan lokal (LocalStorage & Data Dummy).
              </div>
            </div>
            <span className="bg-amber-200/60 font-mono text-[10px] px-2 py-1 rounded-lg">
              Isi .env untuk konek Database
            </span>
          </div>
        )}

        {/* Top Header Title & Action Buttons */}
        <header className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {selectedBatchId === 'ALL'
                  ? 'Semua Batch'
                  : batches.find((b) => b.id === selectedBatchId)?.name || 'Batch tidak ditemukan'}
              </span>
              <span className="text-xs text-slate-400">• Rute Antarkota</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1 capitalize">
              {pageTitle}
            </h2>
          </div>

          <fieldset disabled={authUser.role === 'driver'} className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowScanModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
            >
              <i className="fa-solid fa-camera-retro"></i>
              <span>Scan Struk AI</span>
            </button>
            <button
              onClick={() => {
                setEditingOrder(null);
                setShowOrderModal(true);
              }}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Tambah Order</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
            >
              <i className="fa-solid fa-receipt"></i>
              <span className="hidden sm:inline">Catat Biaya</span>
            </button>
          </fieldset>
          </div>
        </header>

        {/* Router View Rendering */}
        {authUser.role === 'driver' && <p className="text-sm text-slate-500">Role driver: akses baca data operasional.</p>}
        <fieldset disabled={authUser.role === 'driver'} className="min-w-0">
        <AppRoutes
          currentUser={authUser}
          allSettlements={settlements}
          setSettlements={setSettlements}
          metrics={metrics}
          orders={orders}
          filteredOrders={filteredOrders}
          filteredExpenses={filteredExpenses}
          batches={batches}
          setBatches={setBatches}
          settings={settings}
          setSettings={setSettings}
          triggerToast={triggerToast}
          confirmDelete={confirmDelete}
          setEditingOrder={setEditingOrder}
          setShowOrderModal={setShowOrderModal}
          setShowExpenseModal={setShowExpenseModal}
          setShowBatchModal={setShowBatchModal}
          setEditingBatch={setEditingBatch}
          setSelectedBatchId={setSelectedBatchId}
          setOrders={setOrders}
          setExpenses={setExpenses}
          expenses={expenses}
          settlements={filteredSettlements}
          onOpenSettlement={(partner) => {
            if (authUser.role === 'driver') return triggerToast('Pelunasan hanya untuk admin dan koordinator.', 'error');
            if (selectedBatchId === 'ALL') return triggerToast('Pilih satu batch sebelum mencatat pelunasan.', 'error');
            setSettlementPartner(partner);
          }}
          upsertBatch={saveBatchController}
                    deleteBatchFromDb={deleteBatchController}
          upsertOrder={saveOrderController}
          deleteOrderFromDb={deleteOrderController}
          upsertExpense={saveExpenseController}
          deleteExpenseFromDb={deleteExpenseController}
        />
        </fieldset>
      </main>

      {/* MODALS */}
      {showOrderModal && (
        <OrderModal
          editingOrder={editingOrder}
          batches={batches}
          selectedBatchId={selectedBatchId}
          onClose={() => setShowOrderModal(false)}
          confirmDelete={confirmDelete}
          onSave={async (orderData) => {
            if (editingOrder) {
              const updatedObj = { ...editingOrder, ...orderData };
              const savedOrder = await saveOrderController(updatedObj);
              setOrders(orders.map((o) => (o.id === editingOrder.id ? savedOrder || updatedObj : o)));
              triggerToast('Pesanan berhasil diperbarui');
            } else {
              const newId = 'ORD-' + crypto.randomUUID();
              const now = new Date();
              const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
              const newObj = { id: newId, date, ...orderData, ...(!isSupabaseConfigured ? { orderNo: nextLocalOrderNumber(orders, date) } : {}) };
              const savedOrder = await saveOrderController(newObj);
              setOrders([savedOrder || newObj, ...orders]);
              triggerToast('Pesanan baru ditambahkan');
            }
            setShowOrderModal(false);
          }}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          batches={batches}
          selectedBatchId={selectedBatchId}
          onClose={() => setShowExpenseModal(false)}
          onSave={async (expData) => {
            const newId = 'EXP-' + crypto.randomUUID();
            const newObj = { id: newId, date: new Date().toISOString().split('T')[0], ...expData };
            await saveExpenseController(newObj);
            setExpenses([newObj, ...expenses]);
            triggerToast('Pengeluaran operasional dicatat');
            setShowExpenseModal(false);
          }}
        />
      )}

      {showBatchModal && (
        <BatchModal
          editingBatch={editingBatch}
          onClose={() => {
            setEditingBatch(null);
            setShowBatchModal(false);
          }}
          onSave={async (batchData) => {
            if (editingBatch) {
              const updatedObj = { ...editingBatch, ...batchData };
              await saveBatchController(updatedObj);
              setBatches(batches.map((batch) => (batch.id === editingBatch.id ? updatedObj : batch)));
              triggerToast('Batch trip berhasil diperbarui');
            } else {
              const newId = 'BATCH-' + crypto.randomUUID();
              const newObj = { id: newId, ...batchData };
              await saveBatchController(newObj);
              setBatches([...batches, newObj]);
              setSelectedBatchId(newId);
              triggerToast('Batch trip baru dibuat');
            }
            setEditingBatch(null);
            setShowBatchModal(false);
          }}
        />
      )}

      {showScanModal && (
        <ScanReceiptModal
          onClose={() => setShowScanModal(false)}
          onApplyToOrder={(data) => {
            setShowScanModal(false);
            setEditingOrder(null);
            setShowOrderModal(true);
          }}
          triggerToast={triggerToast}
        />
      )}

      {settlementPartner && (
        <SettlementModal
          partner={settlementPartner.name}
          batchName={selectedBatchId === 'ALL' ? 'Semua Batch' : batches.find((batch) => batch.id === selectedBatchId)?.name || 'Batch tidak ditemukan'}
          maxAmount={settlementPartner.outstanding}
          onClose={() => setSettlementPartner(null)}
          onSave={async (settlementData) => {
            const newSettlement = { id: 'SET-' + crypto.randomUUID(), batchId: selectedBatchId, partner: settlementPartner.key, date: new Date().toISOString().split('T')[0], ...settlementData };
            await saveSettlementController(newSettlement);
            setSettlements([newSettlement, ...settlements]);
            triggerToast(`Pelunasan talangan ${settlementPartner.name} dicatat`);
            setSettlementPartner(null);
          }}
        />
      )}
    </div>
  );
}
