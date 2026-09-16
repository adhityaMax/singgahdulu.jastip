import React from 'react';
import { formatRp } from '../../utils/formatters';

export default function SettlementView({ metrics, settlements = [], onOpenSettlement }) {
  const { partnerBreakdown, halfProfit } = metrics;

  const umayTotalPaid = partnerBreakdown.umayTotalSpent;
  const adhitTotalPaid = partnerBreakdown.adhitTotalSpent;

  const getPartnerSettlement = (key, total) => {
    const paid = settlements.filter((settlement) => settlement.partner === key).reduce((sum, settlement) => sum + Number(settlement.amount || 0), 0);
    return { paid, outstanding: Math.max(0, total - paid) };
  };
  const umaySettlement = getPartnerSettlement('Umay', umayTotalPaid);
  const adhitSettlement = getPartnerSettlement('Adhit', adhitTotalPaid);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <h3 className="text-xl font-extrabold">Bagi Hasil & Settlement Rekening Partner</h3>
        <p className="text-xs text-slate-300 mt-1">
          Kalkulasi dana talangan pribadi Umay & Adhit dan pembagian bersih laba fee jastip
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Umay Settlement Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-lg">
              U
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Umay (Koordinator Admin)</h4>
              <p className="text-xs text-slate-500">Kalkulasi Uang Keluar & Hak Laba</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600">Modal Belanja Dikeluarkan (Toko):</span>
              <span className="font-bold text-slate-800">{formatRp(partnerBreakdown.umayModal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600">Talangan Biaya Ops (Bensin/Dll):</span>
              <span className="font-bold text-slate-800">{formatRp(partnerBreakdown.umayExp)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-rose-700 bg-rose-50 p-2 rounded-lg">
              <span>Total Uang Pribadi Keluar:</span>
              <span>{formatRp(umayTotalPaid)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-600">Sudah dilunasi:</span><span className="font-bold text-teal-700">{formatRp(umaySettlement.paid)}</span></div>
            <div className="flex justify-between items-center py-1.5 font-bold text-slate-800 bg-slate-100 p-2 rounded-lg"><span>Sisa perlu dikembalikan:</span><span>{formatRp(umaySettlement.outstanding)}</span></div>
            <div className="flex justify-between py-1.5 font-bold text-teal-800 bg-teal-50 p-2 rounded-lg mt-2">
              <span>+ Hak Bagian Laba Bersih (50%):</span>
              <span>{formatRp(halfProfit)}</span>
            </div>
            <button type="button" disabled={!umaySettlement.outstanding} onClick={() => onOpenSettlement({ key: 'Umay', name: 'Umay', outstanding: umaySettlement.outstanding })} className="w-full py-2 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition"><i className="fa-solid fa-money-bill-transfer mr-2"></i>{umaySettlement.outstanding ? 'Catat Pelunasan Umay' : 'Talangan Umay Sudah Lunas'}</button>
          </div>
        </div>

        {/* Adhit Settlement Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-lg">
              A
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Adhit (Driver Logistik)</h4>
              <p className="text-xs text-slate-500">Kalkulasi Uang Keluar & Hak Laba</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600">Modal Belanja Dikeluarkan (Toko):</span>
              <span className="font-bold text-slate-800">{formatRp(partnerBreakdown.adhitModal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-600">Talangan Biaya Ops (Bensin/Dll):</span>
              <span className="font-bold text-slate-800">{formatRp(partnerBreakdown.adhitExp)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-blue-700 bg-blue-50 p-2 rounded-lg">
              <span>Total Uang Pribadi Keluar:</span>
              <span>{formatRp(adhitTotalPaid)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-600">Sudah dilunasi:</span><span className="font-bold text-teal-700">{formatRp(adhitSettlement.paid)}</span></div>
            <div className="flex justify-between items-center py-1.5 font-bold text-slate-800 bg-slate-100 p-2 rounded-lg"><span>Sisa perlu dikembalikan:</span><span>{formatRp(adhitSettlement.outstanding)}</span></div>
            <div className="flex justify-between py-1.5 font-bold text-teal-800 bg-teal-50 p-2 rounded-lg mt-2">
              <span>+ Hak Bagian Laba Bersih (50%):</span>
              <span>{formatRp(halfProfit)}</span>
            </div>
            <button type="button" disabled={!adhitSettlement.outstanding} onClick={() => onOpenSettlement({ key: 'Adhit', name: 'Adhit', outstanding: adhitSettlement.outstanding })} className="w-full py-2 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition"><i className="fa-solid fa-money-bill-transfer mr-2"></i>{adhitSettlement.outstanding ? 'Catat Pelunasan Adhit' : 'Talangan Adhit Sudah Lunas'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
