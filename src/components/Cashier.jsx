import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Cashier() {
  const [treatments, setTreatments] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0); // ✅ State Diskon
  const [dp, setDp] = useState('');
  const [bayar, setBayar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('name');
    if (error) console.error(error);
    else setTreatments(data || []);
    setLoading(false);
  };

  const addToCart = (t) => {
    setCart(prev => {
      const ada = prev.find(x => x.id === t.id);
      if (ada) return prev.map(x => x.id === t.id ? {...x, qty: x.qty+1} : x);
      return [...prev, {...t, qty:1}];
    });
  };

  const hapusItem = id => setCart(p => p.filter(x => x.id !== id));

  // Hitungan Otomatis
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalSetelahDiskon = Math.max(0, subtotal - (parseFloat(discount) || 0));
  const sisaBayar = totalSetelahDiskon - (parseFloat(dp) || 0);
  const kembalian = Math.max(0, (parseFloat(bayar) || 0) - sisaBayar);

  const simpanTransaksi = async () => {
    if (!customerName || cart.length === 0) return alert('Lengkapi nama & layanan!');
    const { error } = await supabase.from('transactions').insert([{
      customer_name: customerName,
      subtotal: subtotal,
      discount: discount || 0,
      total_amount: totalSetelahDiskon,
      dp: dp || 0,
      remaining: Math.max(0, sisaBayar),
      payment: bayar || 0
    }]);
    if (error) alert('Gagal: ' + error.message);
    else {
      alert('✅ Tersimpan!');
      setCart([]); setCustomerName(''); setDiscount(0); setDp(''); setBayar('');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* KIRI: Form & Pilihan */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-3">👤 Informasi Klien & Reservasi</h3>
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Nama Klien" value={customerName} onChange={e=>setCustomerName(e.target.value)} />
            <input className="border p-2 rounded" placeholder="No HP" />
            <input type="date" className="border p-2 rounded" />
            <input type="time" className="border p-2 rounded" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-3">💅 Pilih Treatment</h3>
          {loading ? <p>Memuat...</p> : (
            <select onChange={e=>addToCart(treatments.find(x=>x.id==e.target.value))} className="w-full border p-2 rounded">
              <option value="">-- Pilih Layanan --</option>
              {treatments.map(t=><option key={t.id} value={t.id}>{t.name} - Rp{t.price?.toLocaleString()}</option>)}
            </select>
          )}

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Item Dipilih</h4>
            {cart.map(i=>(
              <div key={i.id} className="flex justify-between items-center bg-gray-50 p-2 mb-1 rounded">
                <span>{i.name} x{i.qty}</span>
                <span>Rp{(i.price*i.qty).toLocaleString()}</span>
                <button onClick={()=>hapusItem(i.id)} className="text-red-500">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KANAN: PEMBAYARAN (TAMPILAN DISKON LENGKAP) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border h-fit">
        <h3 className="font-bold mb-4 text-lg">💳 Pembayaran & DP</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-base">
            <span>Total Treatment</span>
            <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
          </div>

          {/* ✅ BAGIAN DISKON YANG DICARI & BELUM ADA */}
          <div className="border-y py-3 space-y-2">
            <label className="block font-semibold text-pink-600">💸 Diskon (Rp)</label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e)=>setDiscount(e.target.value)}
              className="w-full border-2 border-pink-200 rounded-lg p-3 focus:outline-none focus:border-pink-500 text-lg"
              placeholder="Masukkan nominal diskon..."
            />
            <div className="flex justify-between font-bold text-lg text-gray-800 mt-2">
              <span>Total Setelah Diskon</span>
              <span className="text-green-600">Rp {totalSetelahDiskon.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span>DP / Uang Muka</span>
            <input type="number" value={dp} onChange={e=>setDp(e.target.value)} className="w-32 border rounded p-1 text-right" />
          </div>

          <div className="flex justify-between font-bold text-red-600">
            <span>Sisa Bayar</span>
            <span>Rp {Math.max(0, sisaBayar).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Uang Dibayarkan</span>
            <input type="number" value={bayar} onChange={e=>setBayar(e.target.value)} className="w-32 border rounded p-1 text-right" />
          </div>

          <div className="flex justify-between font-bold text-lg text-blue-700">
            <span>Kembalian</span>
            <span>Rp {kembalian.toLocaleString()}</span>
          </div>

          <button onClick={simpanTransaksi} className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-lg">
            💾 Simpan & Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
