import React from 'react';
import { formatRp } from '../../utils/formatters';

export default function DashboardView({ metrics, orders, settings, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omset Batch</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">{formatRp(metrics.totalOmset)}</h2>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-teal-700 font-bold">{orders.length}</span> transaksi pesanan
            </p>
          </div>
        </div>

        {/* Modal Belanja */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modal Belanja Barang</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">{formatRp(metrics.totalModal)}</h2>
            <p className="text-xs text-slate-500 mt-1">Total harga barang di toko</p>
          </div>
        </div>

        {/* Total DP Terkumpul */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kas DP / Lunas Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-emerald-600">{formatRp(metrics.totalCollectedDp)}</h2>
            <p className="text-xs text-rose-500 mt-1 font-semibold">
              Sisa Piutang: {formatRp(metrics.totalRemainingUnpaid)}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Laba Bersih Ditangan</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-teal-300 flex items-center justify-center text-sm">
              <i className="fa-solid fa-coins"></i>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-white">{formatRp(metrics.netProfit)}</h2>
            <p className="text-xs text-slate-400 mt-1">Setelah dikurangi operasional trip</p>
          </div>
        </div>
      </div>

      {/* Secondary Dashboard Section: Bagi Hasil & Settlement Quick Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kas Pembelanjaan ("Uang Siapa") Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <i className="fa-solid fa-scale-balanced text-teal-700"></i>
              <span>Sumber Uang Belanja Dibeli</span>
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50 border border-rose-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold flex items-center justify-center text-[11px]">
                  U
                </span>
                <span className="font-semibold text-slate-700">Umay Dihutangi</span>
              </div>
              <span className="font-black text-rose-700">
                {formatRp(metrics.partnerBreakdown.umayTotalSpent)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center text-[11px]">
                  A
                </span>
                <span className="font-semibold text-slate-700">Adhit Dihutangi</span>
              </div>
              <span className="font-black text-blue-700">
                {formatRp(metrics.partnerBreakdown.adhitTotalSpent)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                  K
                </span>
                <span className="font-semibold text-slate-700">Dari Kas Jastip</span>
              </div>
              <span className="font-black text-emerald-700">
                {formatRp(metrics.partnerBreakdown.kasTotalSpent)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settlement')}
            className="w-full text-center text-xs font-bold text-teal-700 hover:text-teal-800 pt-2 block"
          >
            Lihat Detail Settlement Partner ➔
          </button>
        </div>

        {/* Profit Split Partner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Estimasi Laba Bersih 50:50</h3>
                <p className="text-xs text-slate-500">Hasil bersih fee jastip dikurangi bensin & packing</p>
              </div>
              <span className="bg-teal-50 text-teal-800 text-xs px-2.5 py-1 rounded-full font-bold">
                Auto Split 50%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Umay */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center">
                    U
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Umay</h4>
                    <p className="text-[10px] text-slate-500">Admin & Koordinator Order</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-600">Hak Profit Fee (50%):</span>
                  <span className="font-bold text-teal-800">{formatRp(metrics.halfProfit)}</span>
                </div>
              </div>

              {/* Adhit */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Adhit</h4>
                    <p className="text-[10px] text-slate-500">Driver & Logistik Motor</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-600">Hak Profit Fee (50%):</span>
                  <span className="font-bold text-teal-800">{formatRp(metrics.halfProfit)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Total Pengeluaran Ops: <strong className="text-rose-600">{formatRp(metrics.totalOpsExpense)}</strong>
            </span>
            <button
              onClick={() => onNavigate('orders')}
              className="font-bold text-teal-700 hover:underline"
            >
              Kelola Semua Pesanan ➔
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base">Pesanan Terbaru Batch Ini</h3>
          <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-teal-700 hover:underline">
            Lihat Semua Pesanan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ID & Pemesan</th>
                <th className="py-3 px-4">Detail Barang</th>
                <th className="py-3 px-4">Toko Tujuan</th>
                <th className="py-3 px-4">Total & Status Bayar</th>
                <th className="py-3 px-4">Nominal DP</th>
                <th className="py-3 px-4">Pembeli (Uang)</th>
                <th className="py-3 px-4">Status Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((o) => {
                const total = (o.price + o.fee) * o.qty;
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {o.id}
                      <br />
                      <span className="text-slate-500 font-normal">{o.customer}</span>
                    </td>
                    <td className="py-3 px-4">
                      {o.item} <span className="font-bold text-teal-700">x{o.qty}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{o.store}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{formatRp(total)}</div>
                      <span
                        className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-0.5 ${
                          o.payStatus === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.payStatus === 'DP'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {o.payStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {o.payStatus === 'DP' ? formatRp(o.dpAmount) : o.payStatus === 'LUNAS' ? 'Lunas 100%' : 'Rp 0'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium text-[11px]">
                        {o.buyer || 'Umay'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          o.itemStatus === 'DIBELI'
                            ? 'bg-teal-100 text-teal-800'
                            : o.itemStatus === 'KOSONG'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {o.itemStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    Belum ada pesanan untuk batch ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
