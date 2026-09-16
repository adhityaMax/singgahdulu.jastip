import React from 'react';
import { payOffOrder } from '../services/orderService';
import { Routes, Route, useNavigate } from 'react-router-dom';

import DashboardView from '../components/views/DashboardView';
import BatchesView from '../components/views/BatchesView';
import OrdersView from '../components/views/OrdersView';
import ShoppingView from '../components/views/ShoppingView';
import ExpensesView from '../components/views/ExpensesView';
import SettlementView from '../components/views/SettlementView';
import ReceiptView from '../components/views/ReceiptView';
import AiToolsView from '../components/views/AiToolsView';
import SettingsView from '../components/views/SettingsView';

export default function AppRoutes({
  metrics,
  orders,
  filteredOrders,
  filteredExpenses,
  batches,
  setBatches,
  settings,
  setSettings,
  triggerToast,
  setEditingOrder,
  setShowOrderModal,
  setShowExpenseModal,
  setShowBatchModal,
  setEditingBatch,
  setSelectedBatchId,
  setOrders,
  setExpenses,
  expenses,
  upsertBatch,
  deleteBatchFromDb,
  upsertOrder,
  deleteOrderFromDb,
  upsertExpense,
  deleteExpenseFromDb,
  settlements,
  onOpenSettlement,
  currentUser,
  setSettlements,
  allSettlements,
}) {
  const navigate = useNavigate();

  const mutate = async (action) => {
    try { await action(); } catch (error) { triggerToast(error.message || 'Gagal menyimpan data.', 'error'); }
  };
  const updateOrder = (id, changes) => mutate(async () => {
    const updated = { ...orders.find(order => order.id === id), ...changes };
    await upsertOrder(updated);
    setOrders(orders.map(order => order.id === id ? updated : order));
  });

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardView
            metrics={metrics}
            orders={filteredOrders}
            settings={settings}
            onNavigate={(path) => navigate('/' + (path === 'dashboard' ? '' : path))}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <DashboardView
            metrics={metrics}
            orders={filteredOrders}
            settings={settings}
            onNavigate={(path) => navigate('/' + (path === 'dashboard' ? '' : path))}
          />
        }
      />
      <Route
        path="/batches"
        element={
          <BatchesView
            batches={batches}
            setBatches={async (updatedBatches) => {
              await Promise.all(updatedBatches.filter(b => b !== batches.find(old => old.id === b.id)).map(upsertBatch));
              setBatches(updatedBatches);
            }}
            onOpenModal={() => {
              setEditingBatch(null);
              setShowBatchModal(true);
            }}
            onEdit={(batch) => {
              setEditingBatch(batch);
              setShowBatchModal(true);
            }}
            onDelete={(batch) => mutate(async () => {
              if (!window.confirm(`Hapus ${batch.name}? Order dan biaya terkait juga akan dihapus.`)) return;
              await deleteBatchFromDb(batch.id);
              setSettlements(allSettlements.filter(item => item.batchId !== batch.id));
              const updatedBatches = batches.filter((item) => item.id !== batch.id);
              setBatches(updatedBatches);
              setOrders(orders.filter((order) => order.batchId !== batch.id));
              setExpenses(expenses.filter((expense) => expense.batchId !== batch.id));
              setSelectedBatchId(updatedBatches[0]?.id || 'ALL');
              triggerToast('Batch trip berhasil dihapus');
            })}
            onSelectBatch={(id) => setSelectedBatchId(id)}
            triggerToast={triggerToast}
          />
        }
      />
      <Route
        path="/orders"
        element={
          <OrdersView
            orders={filteredOrders}
            batches={batches}
            onPayOff={async (order) => {
              if (!['admin', 'koordinator'].includes(currentUser.role)) throw new Error('Anda tidak memiliki akses pelunasan.');
              const updated = await payOffOrder(order);
              setOrders(orders.map(item => item.id === updated.id ? updated : item));
              triggerToast('Pembayaran lunas. Kas masuk dan sisa piutang diperbarui.');
            }}
            onEdit={(order) => {
              setEditingOrder(order);
              setShowOrderModal(true);
            }}
            onDelete={(id) => mutate(async () => {
              await deleteOrderFromDb(id);
              setOrders(orders.filter((o) => o.id !== id));
              triggerToast('Pesanan berhasil dihapus');
            })}
            onToggleStatus={(id) => updateOrder(id, { itemStatus: orders.find(o => o.id === id).itemStatus === 'DIBELI' ? 'PENDING' : 'DIBELI' })}
            onOpenNew={() => {
              setEditingOrder(null);
              setShowOrderModal(true);
            }}
          />
        }
      />
      <Route
        path="/shopping"
        element={
          <ShoppingView
            orders={filteredOrders}
            onToggleStatus={(id) => updateOrder(id, { itemStatus: orders.find(o => o.id === id).itemStatus === 'DIBELI' ? 'PENDING' : 'DIBELI' })}
            onChangeBuyer={(id, buyer) => updateOrder(id, { buyer })}
          />
        }
      />
      <Route
        path="/expenses"
        element={
          <ExpensesView
            expenses={filteredExpenses}
            batches={batches}
            onDelete={(id) => mutate(async () => {
              await deleteExpenseFromDb(id);
              setExpenses(expenses.filter((e) => e.id !== id));
              triggerToast('Biaya berhasil dihapus');
            })}
            onOpenNew={() => setShowExpenseModal(true)}
          />
        }
      />
      <Route
        path="/settlement"
        element={
          <SettlementView metrics={metrics} settlements={settlements} onOpenSettlement={onOpenSettlement} />
        }
      />
      <Route
        path="/receipt"
        element={<ReceiptView orders={filteredOrders} settings={settings} />}
      />
      <Route
        path="/ai-tools"
        element={<AiToolsView settings={settings} triggerToast={triggerToast} />}
      />
      <Route
        path="/settings"
        element={
          currentUser.role === 'admin' ? <SettingsView settings={settings} setSettings={setSettings} triggerToast={triggerToast} /> : <p>Pengaturan hanya dapat diubah oleh admin.</p>
        }
      />
    </Routes>
  );
}
