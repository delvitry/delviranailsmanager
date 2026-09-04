import React from 'react';
import PriceList from './components/PriceList';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Aplikasi */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm text-center">
        <h1 className="font-bold text-gray-800 text-base">✨ Delvira Nails Manager ✨</h1>
        <p className="text-[10px] text-gray-500">Sistem POS & Studio Management</p>
      </header>

      {/* Konten Utama */}
      <main className="flex-1">
        <PriceList />
      </main>
    </div>
  );
}
