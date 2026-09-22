import React, { useMemo } from 'react';
import { formatRp } from '../../utils/formatters';
import { getOrderItems } from '../../utils/orderTotals';

export default function ShoppingView({ orders, onToggleStatus, onChangeBuyer }) {
  const storesMap = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      getOrderItems(o).forEach(item => {
        if (!map[item.store]) map[item.store] = [];
        map[item.store].push({ order: o, item });
      });
    });
    return map;
  }, [orders]);

  const totalItems = orders.reduce((sum, o) => sum + getOrderItems(o).length, 0);
  const boughtItems = orders.filter((o) => o.itemStatus === 'DIBELI').reduce((sum, o) => sum + getOrderItems(o).length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Checklist Belanja Per Toko</h3>
          <p className="text-xs text-slate-500">
            Gunakan saat belanja di lokasi (Jogja/Semarang/Surabaya) dari HP
          </p>
        </div>
        <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl text-teal-800 font-extrabold text-xs">
          Progress: {boughtItems}/{totalItems} Selesai Dibeli
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(storesMap).map((storeName) => {
          const storeOrders = storesMap[storeName];
          return (
            <div key={storeName} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-store text-teal-700"></i>
                  <h4 className="font-bold text-slate-800 text-sm">{storeName}</h4>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                  {storeOrders.length} item
                </span>
              </div>

              <div className="space-y-2">
                {storeOrders.map(({ order: o, item }, index) => (
                  <div
                    key={`${o.id}-${index}`}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      o.itemStatus === 'DIBELI'
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-800">
                        {item.item}{item.variant ? ` (${item.variant})` : ''} <span className="text-teal-700 font-extrabold">x{item.qty}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Pemesan: <strong>{o.customer}</strong> (Harga Toko: {formatRp(Number(item.price) * Number(item.qty))})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Buyer Selection ("Uang Siapa") */}
                      <select
                        value={o.buyer || 'Umay'}
                        onChange={(e) => onChangeBuyer(o.id, e.target.value)}
                        className="text-[11px] font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="Umay">Uang Umay</option>
                        <option value="Adhit">Uang Adhit</option>
                        <option value="Kas Jastip">Kas Jastip</option>
                      </select>

                      <button
                        onClick={() => onToggleStatus(o.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-bold transition flex items-center space-x-1 ${
                          o.itemStatus === 'DIBELI'
                            ? 'bg-teal-700 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <i className={`fa-solid ${o.itemStatus === 'DIBELI' ? 'fa-check' : 'fa-cart-shopping'}`}></i>
                        <span>{o.itemStatus === 'DIBELI' ? 'Dibeli' : 'Tandai'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(storesMap).length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            Belum ada daftar belanjaan untuk batch ini.
          </div>
        )}
      </div>
    </div>
  );
}
