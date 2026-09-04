import React, { useState } from 'react';
import PriceList from './components/PriceList';
import Cashier from './components/Cashier';

export default function App() {
  const [activeTab, setActiveTab] = useState('cashier');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Aplikasi */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm text-center">
        <h1 className="font-bold text-gray-800 text-base">✨ Delvira Nails Manager ✨</h1>
        <p className="text-[10px] text-gray-500">Sistem POS & Studio Management</p>
        
        {/* Tombol Navigasi Menu */}
        <div className="flex justify-center gap-2 mt-3">
          <button
            onClick={() => setActiveTab('cashier')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'cashier' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🛒 Kasir (POS)
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'prices' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📋 Price List
          </button>
        </div>
      </header>

      {/* Konten Utama Berdasarkan Menu yang Dipilih */}
      <main className="flex-1 py-4">
        {activeTab === 'cashier' ? <Cashier /> : <PriceList />}
      </main>
    </div>
  );
}
