import React, { useState } from 'react';
import { apiKey, fetchGeminiWithBackoff, base64ToArrayBuffer, pcmToWav } from '../../utils/geminiApi';

export default function AiToolsView({ settings, triggerToast }) {
  const [route, setRoute] = useState('Jogja ➔ Salatiga');
  const [items, setItems] = useState('Bakpia Kukus Tugu, Donat Kalis, Gudeg Yu Djum');
  const [cutoff, setCutoff] = useState('Jumat, 18.00 WIB');
  const [arrival, setArrival] = useState('Sabtu Sore');

  // AI Output states
  const [captionText, setCaptionText] = useState('');
  const [loadingCaption, setLoadingCaption] = useState(false);

  const [posterUrl, setPosterUrl] = useState('');
  const [loadingPoster, setLoadingPoster] = useState(false);

  const [audioUrl, setAudioUrl] = useState('');
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Generate Caption
  const generateCaption = async () => {
    setLoadingCaption(true);
    setCaptionText('');
    const systemPrompt = `Kamu adalah copywriter media sosial jastip bernama ${settings.storeName}. Buat caption Instagram & WA yang ramah, menarik, lengkap dengan emoji dan SOP DP/pembayaran awal.`;
    const userPrompt = `Buatkan caption Open PO untuk rute ${route}. Barang hits: ${items}. Cutoff PO: ${cutoff}. Sampai di Salatiga: ${arrival}.`;

    try {
      const res = await fetchGeminiWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );
      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) setCaptionText(txt);
    } catch (err) {
      setCaptionText('Error: ' + err.message);
    } finally {
      setLoadingCaption(false);
    }
  };

  // Generate Poster Image (gemini-3.1-flash-image)
  const generatePoster = async () => {
    setLoadingPoster(true);
    setPosterUrl('');
    const prompt = `A clean minimalist 9:16 Instagram story promotional poster banner for "${settings.storeName}". Deep teal and warm cream palette, featuring a cute vector doodle illustration of a couple on a scooter with delivery boxes, with elegant legible text "OPEN PO JASTIP: ${route}" and highlighting items "${items}". Professional graphic design.`;

    try {
      const res = await fetchGeminiWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ['IMAGE'],
              imageConfig: { aspectRatio: '9:16' },
            },
          }),
        }
      );
      const data = await res.json();
      const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) {
        setPosterUrl(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    } catch (err) {
      triggerToast('Gagal generate poster: ' + err.message, 'error');
    } finally {
      setLoadingPoster(false);
    }
  };

  // Generate Voice Note TTS
  const generateTTS = async () => {
    setLoadingAudio(true);
    setAudioUrl('');
    const promptText = `Ucapkan dengan ceria: Halo teman-teman Salatiga! Open PO jastip ${settings.storeName} rute ${route} sudah dibuka! Mau titip ${items}? Slot terbatas, yuk order sekarang!`;

    try {
      const res = await fetchGeminiWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
            },
          }),
        }
      );
      const data = await res.json();
      const part = data?.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        const sampleRateMatch = part.inlineData.mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
        const pcmData = base64ToArrayBuffer(part.inlineData.data);
        const pcm16 = new Int16Array(pcmData);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        setAudioUrl(URL.createObjectURL(wavBlob));
      }
    } catch (err) {
      triggerToast('Gagal generate TTS: ' + err.message, 'error');
    } finally {
      setLoadingAudio(false);
    }
  };

  // Submit AI Chat
  const submitChat = async () => {
    if (!chatQuery.trim()) return;
    setLoadingChat(true);
    setChatResponse('');

    const systemPrompt = `Kamu adalah pakar konsultan bisnis jastip antarkota di Jawa Tengah (Jogja, Semarang, Surabaya, Salatiga) untuk ${settings.storeName} yang dikelola Umay & Adhit. Berikan saran praktis & santai.`;

    try {
      const res = await fetchGeminiWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: chatQuery }] }],
            tools: [{ google_search: {} }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );
      const data = await res.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) setChatResponse(txt);
    } catch (err) {
      setChatResponse('Error: ' + err.message);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
          <i className="fa-solid fa-sparkles mr-1"></i> Powered by Gemini 3 Intelligence
        </span>
        <h3 className="text-xl font-extrabold">AI Assistant & Content Generator</h3>
        <p className="text-xs text-slate-300 mt-1">
          Buat poster Story IG, caption promosi, voice note WA broadcast, dan konsultasi tren kuliner
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: Poster & Content Generator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center space-x-2">
            <i className="fa-solid fa-bullhorn text-indigo-600"></i>
            <span>Generator Poster & Promo Open PO</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Rute Trip</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Highlight Barang Jastip Utama</label>
              <input
                type="text"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tanggal Cut-off PO</label>
                <input
                  type="text"
                  value={cutoff}
                  onChange={(e) => setCutoff(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tiba di Salatiga</label>
                <input
                  type="text"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={generateCaption}
                disabled={loadingCaption}
                className="bg-indigo-600 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                {loadingCaption ? 'Membuat...' : 'Buat Caption IG/WA'}
              </button>
              <button
                onClick={generatePoster}
                disabled={loadingPoster}
                className="bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-teal-800 transition"
              >
                {loadingPoster ? 'Menggambar...' : 'Generate Banner Story'}
              </button>
              <button
                onClick={generateTTS}
                disabled={loadingAudio}
                className="bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl hover:bg-amber-600 transition"
              >
                {loadingAudio ? 'Membuat...' : 'Buat Voice Note WA'}
              </button>
            </div>
          </div>

          {/* Caption Output */}
          {captionText && (
            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <span className="font-bold text-slate-700">Hasil Caption Media Sosial:</span>
              <textarea
                readOnly
                value={captionText}
                rows="6"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
          )}

          {/* Poster Preview */}
          {posterUrl && (
            <div className="pt-3 border-t border-slate-100 text-xs text-center space-y-2">
              <span className="font-bold text-slate-700 block text-left">Hasil Preview Banner Story IG:</span>
              <img src={posterUrl} alt="Poster" className="max-w-xs mx-auto rounded-xl shadow-md border" />
            </div>
          )}

          {/* Audio Output */}
          {audioUrl && (
            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <span className="font-bold text-slate-700">Audio Voice Note WA:</span>
              <audio controls src={audioUrl} className="w-full h-8"></audio>
            </div>
          )}
        </div>

        {/* Tool 2: AI Trend Scout */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center space-x-2">
            <i className="fa-solid fa-brain text-teal-700"></i>
            <span>Konsultasi AI & Trend Scout Kuliner</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setChatQuery('Jajanan kuliner hits terbaru di Jogja yang paling diminati jastip?')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]"
              >
                🍿 Jajanan Hits Jogja
              </button>
              <button
                onClick={() =>
                  setChatQuery(
                    'Saran fee jastip & packing aman naik motor untuk Gudeg Besek dan Donat Kalis?'
                  )
                }
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]"
              >
                🛵 Tips Packing Motor
              </button>
            </div>

            <textarea
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              rows="3"
              placeholder="Tanyakan apa saja seputar strategi bisnis jastip..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none"
            />

            <button
              onClick={submitChat}
              disabled={loadingChat}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl transition"
            >
              {loadingChat ? 'Menganalisis...' : 'Kirim Pertanyaan'}
            </button>

            {chatResponse && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                {chatResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
