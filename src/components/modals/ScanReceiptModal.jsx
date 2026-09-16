import React, { useState } from 'react';
import { apiKey, fetchGeminiWithBackoff } from '../../utils/geminiApi';
import { formatRp } from '../../utils/formatters';

export default function ScanReceiptModal({ onClose, onApplyToOrder, triggerToast }) {
  const [base64Img, setBase64Img] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBase64Img(ev.target.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScan = async () => {
    if (!base64Img) return;
    setLoading(true);

    const prompt = `Analisis foto struk ini. Ekstrak data dalam JSON: {"storeName": "Nama Toko", "itemName": "Nama Barang", "price": 45000}`;

    try {
      const res = await fetchGeminiWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Img } }],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) {
        setResultData(JSON.parse(txt));
      }
    } catch (err) {
      triggerToast('Gagal memproses struk: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
            <h3 className="font-bold text-slate-800 text-base">AI Scan Struk Belanja Vision</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <input type="file" accept="image/*" onChange={handleFile} className="w-full text-slate-500" />

          {loading && (
            <div className="text-center py-4 space-y-2 text-indigo-600 font-bold">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              <p>Membaca foto struk dengan Gemini Vision...</p>
            </div>
          )}

          {resultData && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2">
              <span className="font-bold text-indigo-900">Hasil Deteksi Struk:</span>
              <div>
                <strong>Toko:</strong> {resultData.storeName || '-'}
              </div>
              <div>
                <strong>Barang:</strong> {resultData.itemName || '-'}
              </div>
              <div>
                <strong>Harga:</strong> {formatRp(resultData.price || 0)}
              </div>
              <button
                onClick={() => onApplyToOrder(resultData)}
                className="w-full mt-2 bg-teal-700 text-white font-bold py-1.5 rounded-lg"
              >
                Isi ke Form Order
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-600">
              Tutup
            </button>
            <button
              onClick={processScan}
              disabled={!base64Img || loading}
              className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl"
            >
              Proses Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
