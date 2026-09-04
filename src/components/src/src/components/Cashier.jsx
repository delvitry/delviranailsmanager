import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Cashier() {
  const [treatments, setTreatments] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0); // Diskon dalam Rupiah atau persen
  const [loading, setLoading] = useState(true);

  // Ambil daftar treatment dari database
  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Gagal memuat treatment:', error.message);
    } else {
      setTreatments(data || []);
    }
    setLoading(false);
  };

  // Tambah treatment ke keranjang
  const addToCart = (treatment) => {
    const existing = cart.find((item) => item.id === treatment.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === treatment.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...treatment, qty: 1 }]);
    }
  };

  // Kurangi atau hapus dari keranjang
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Hitung Subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  // Hitung Total Akhir setelah Diskon
  const finalTotal = Math.max(0, subtotal - (parseFloat(discount) || 0));

  // Proses Simpan Transaksi ke Database
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    if (!customerName) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    // 1. Simpan ke tabel transactions
    const { data: transData, error: transError } = await supabase
      .from('transactions')
      .insert([
        {
          customer_name: customerName,
          subtotal: subtotal,
          discount: parseFloat(discount) || 0,
          total_amount: finalTotal,
          payment_method: 'Cash',
          status: 'Completed'
        }
      ])
      .select();

    if (transError) {
      alert('Gagal memproses transaksi: ' + transError.message);
      return;
    }

    alert('Transaksi berhasil disimpan! 🎉');
    
    // Reset form & keranjang
    setCart([]);
    setCustomerName('');
    setDiscount(0);
  };

  return (
    <div className="p-4 pb-24 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Kolom Kiri: Daftar Treatment yang Bisa Dipilih */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-gray-700">💅 Pilih Treatment</h2>
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Memuat menu...</p>
        ) : treatments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Belum ada treatment di database. Tambahkan dulu di Price List!</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {treatments.map((item) => (
              <div 
                key={item.id} 
                onClick={() => addToCart(item)}
                className="flex justify-between items-center p-2.5 bg-gray-50 hover:bg-blue-50 cursor-pointer rounded-lg border border-gray-100 transition text-xs"
              >
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-blue-900">Rp {item.price.toLocaleString('id-ID')}</p>
                  <span className="text-[10px] text-gray-400">+ Klik pilih</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kolom Kanan: Keranjang & Pembayaran (Dilengkapi Diskon) */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-700">🛒 Keranjang Kasir</h2>
          
          <div>
            <label className="text-[10px] text-gray-500 font-medium">Nama Pelanggan</label>
            <input
              type="text"
              placeholder="Contoh: Siska"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* List item di keranjang */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Keranjang masih kosong</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-xs">
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-500">Rp {item.price.toLocaleString('id-ID')} x {item.qty}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 font-bold px-2 py-1 text-xs hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ringkasan Harga & Diskon */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          {/* Kotak Input Diskon */}
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Diskon (Rp)</span>
            <input
              type="number"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-28 p-1 border border-gray-300 rounded text-right text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-dashed border-gray-200 pt-2">
            <span>Total Akhir</span>
            <span className="text-blue-600">Rp {finalTotal.toLocaleString('id-ID')}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition mt-2"
          >
            Selesaikan Transaksi & Bayar
          </button>
        </div>
      </div>
    </div>
  );
}
