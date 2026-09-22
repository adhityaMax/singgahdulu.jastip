import React, { useState, useMemo } from 'react';
import { formatRp } from '../../utils/formatters';
import EscPosEncoder from 'esc-pos-encoder';
import Swal from 'sweetalert2';
import { getOrderItems, getOrderTotals, getOrderTotal } from '../../utils/orderTotals';
import { displayOrderNumber } from '../../utils/orderNumber';

export default function ReceiptView({ orders, settings }) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');

  const order = useMemo(() => orders.find((o) => o.id === selectedOrderId) || orders[0], [orders, selectedOrderId]);

  const handleBluetoothPrint = async () => {
    if (!order) return;

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Standard printing service
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      // 32 columns match the existing 58 mm receipt layout.
      const columns = 32;
      const separator = '-'.repeat(columns);
      const receiptColumns = [
        { width: 15, marginRight: 1, align: 'left' },
        { width: 16, align: 'right' },
      ];
      const cell = (value, bold = false) => (printer) =>
        printer.bold(bold).text(String(value ?? '')).bold(false);
      const { price: subtotal, fee } = getOrderTotals(order);
      const itemLines = getOrderItems(order).flatMap(item => [
        `${item.item}${item.variant ? ` (${item.variant})` : ''} - ${item.store}`,
        `Harga ${formatRp(item.price)} x ${item.qty} = ${formatRp(Number(item.price) * Number(item.qty))}`,
        `Fee ${formatRp(item.fee)} x ${item.qty} = ${formatRp(Number(item.fee) * Number(item.qty))}`,
      ]);
      const encoder = new EscPosEncoder({ columns });
      const result = encoder
        .initialize()
        .align('center')
        .bold(true)
        .line(settings.storeName.toUpperCase())
        .bold(false)
        .line(`${settings.ig} | WA: ${settings.wa}`)
        .line(settings.address)
        .align('left')
        .line(separator)
        .newline()
        .table(receiptColumns, [
          ['No. Order:', cell(displayOrderNumber(order), true)],
          ['Tanggal:', cell(order.date)],
          ['Pemesan:', cell(order.customer, true)],
          ['Pickup:', cell(order.pickup)],
        ])
        .newline()
        .line(separator)
        .line(itemLines.join('\n'))
        .line(separator)
        .newline()
        .table(receiptColumns, [
          ['Harga Barang:', cell(formatRp(subtotal))],
          ['Fee Jastip:', cell(formatRp(fee))],
        ])
        .rule({ style: 'single', width: columns })
        .table(receiptColumns, [
          [cell('TOTAL TAGIHAN:', true), cell(formatRp(subtotal + fee), true)],
          ['Status Bayar:', cell(order.payStatus, true)],
          ['Sudah dibayar:', cell(formatRp(order.payStatus === 'LUNAS' ? subtotal + fee : order.payStatus === 'DP' ? Number(order.dpAmount) : 0))],
          ['Sisa bayar:', cell(formatRp(Math.max(0, subtotal + fee - (order.payStatus === 'LUNAS' ? subtotal + fee : Number(order.dpAmount || 0)))))],
        ])
        .newline()
        .line(separator)
        .align('center')
        .line(`Terima kasih nitip di ${settings.storeName}!`)
        .line('Titipan aman, perut kenyang.')
        .newline()
        .newline()
        .newline()
        .cut()
        .encode();

      // Chunking data to prevent "Value can't exceed 512 bytes" error
      const chunkSize = 500; // Safer slightly smaller batch size
      for (let i = 0; i < result.length; i += chunkSize) {
        const chunk = result.slice(i, i + chunkSize);
        await characteristic.writeValueWithResponse(chunk);
      }
      console.log('Printed successfully');

    } catch (error) {
      console.error('Print failed', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mencetak',
        html: `Gagal mencetak: ${error.message}.<br/><br/>
               Pastikan:<br/>
               1. Menggunakan Google Chrome / Microsoft Edge. (Brave memblokir Web Bluetooth).<br/>
               2. Situs berjalan di localhost atau HTTPS.`
      });
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-lg">Cetak Struk / Nota Jastip</h3>
          <p className="text-xs text-slate-500">Pilih pemesan untuk menampilkan preview nota thermal printer</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            aria-label="Pilih order pemesan"
            className="min-w-0 w-full max-w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none bg-white font-semibold sm:col-span-2 lg:col-span-1"
          >
            <option value="">-- Pilih Order Pemesan --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {displayOrderNumber(o)} - {o.customer} ({getOrderItems(o).map(item => item.item).join(', ')})
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="w-full bg-teal-700 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-teal-800 transition flex items-center justify-center gap-1.5 shadow-sm lg:w-auto"
          >
            <i className="fa-solid fa-print"></i>
            <span>Cetak Struk</span>
          </button>
          
          <button
            onClick={handleBluetoothPrint}
            disabled={!order}
            className="w-full bg-indigo-600 disabled:bg-slate-300 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 shadow-sm lg:w-auto"
          >
            <i className="fa-brands fa-bluetooth-b"></i>
            <span>Cetak via Bluetooth</span>
          </button>
        </div>
      </div>

      {order ? (
        <div className="flex min-w-0 justify-center bg-slate-200/60 p-3 sm:p-6 lg:p-10 rounded-2xl">
          <div className="print-area min-w-0 bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-slate-300 w-full max-w-xs font-mono text-xs space-y-4 break-words">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900">{settings.storeName}</h4>
              <p className="text-[10px] text-slate-500">{settings.ig} | WA: {settings.wa}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{settings.address}</p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="shrink-0">No. Order:</span> <span className="min-w-0 text-right font-bold">{displayOrderNumber(order)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span> <span>{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Pemesan:</span> <span className="font-bold">{order.customer}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="shrink-0">Pickup:</span> <span className="min-w-0 text-right">{order.pickup}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-2">
              {getOrderItems(order).map((item, index) => <div key={index} className="space-y-0.5">
                <div className="font-bold break-words">{item.item}{item.variant ? ` (${item.variant})` : ''}</div>
                <div className="text-[10px] text-slate-500">Toko: {item.store}</div>
                <div className="flex justify-between gap-2"><span>Harga {formatRp(item.price)} x {item.qty}</span><span>{formatRp(Number(item.price) * Number(item.qty))}</span></div>
                <div className="flex justify-between gap-2"><span>Fee {formatRp(item.fee)} x {item.qty}</span><span>{formatRp(Number(item.fee) * Number(item.qty))}</span></div>
              </div>)}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Harga Barang:</span>
                <span>{formatRp(getOrderTotals(order).price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee Jastip:</span>
                <span>{formatRp(getOrderTotals(order).fee)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-slate-200">
                <span>TOTAL TAGIHAN:</span>
                <span>{formatRp(getOrderTotal(order))}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Status Bayar:</span>
                <span className="font-bold">{order.payStatus}</span>
              </div>
              <div className="flex justify-between"><span>Sudah dibayar:</span><span>{formatRp(order.payStatus === 'LUNAS' ? getOrderTotal(order) : order.payStatus === 'DP' ? Number(order.dpAmount) : 0)}</span></div>
              <div className="flex justify-between font-bold"><span>Sisa bayar:</span><span>{formatRp(Math.max(0, getOrderTotal(order) - (order.payStatus === 'LUNAS' ? getOrderTotal(order) : Number(order.dpAmount || 0))))}</span></div>
            </div>

            <div className="text-center border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500 space-y-0.5">
              <p>Terima kasih nitip di {settings.storeName}! ✨</p>
              <p>Titipan aman, perut kenyang.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
          Silakan pilih order terlebih dahulu di atas.
        </div>
      )}
    </div>
  );
}
