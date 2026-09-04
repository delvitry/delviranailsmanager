import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PriceList() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gel Polish');
  const [price, setPrice] = useState('');

  const fetchTreatments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Gagal memuat data:', error.message);
    } else {
      setTreatments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Nama dan Harga treatment wajib diisi!');
      return;
    }

    const { error } = await supabase.from('treatments').insert([
      {
        name,
        category,
        price: parseFloat(price),
        duration_minutes: 60,
        is_active: 1
      }
    ]);

    if (error) {
      alert('Gagal menambah treatment: ' + error.message);
    } else {
      setName('');
      setPrice('');
      fetchTreatments();
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto space-y-4">
      <h1 className="text-lg font-bold text-gray-800">📋 Katalog Price List</h1>

      <form onSubmit={handleAddTreatment} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <p className="text-xs font-bold text-gray-700">Tambah Treatment Baru</p>
        <div>
          <label className="text-[10px] text-gray-500 font-medium">Nama Treatment</label>
          <input
            type="text"
            placeholder="Contoh: Gel Polish Premium"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 font-medium">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Gel Polish">Gel Polish</option>
              <option value="Nail Art">Nail Art</option>
              <option value="Extension">Extension</option>
              <option value="Removal">Removal</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-medium">Harga (Rp)</label>
            <input
              type="number"
              placeholder="150000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
        >
          Simpan ke Database
        </button>
      </form>

      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-2">
        <p className="text-xs font-bold text-gray-700">Daftar Treatment Tersedia</p>
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Memuat data...</p>
        ) : treatments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Belum ada data treatment.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {treatments.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{item.category}</span>
                </div>
                <p className="font-extrabold text-blue-900">Rp {item.price.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
