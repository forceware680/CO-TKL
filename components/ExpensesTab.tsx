import React, { useState, useMemo, useEffect } from 'react';
import type { GoodsOutTransaction, GoodOutRecord } from '../App';

interface StockSummaryItem {
    name: string;
    stock: number;
    unit: string;
    price: number;
}

interface CurrentItem extends StockSummaryItem {
    quantity: number;
}


interface ExpensesTabProps {
    currencyFormatter: (amount: number) => string;
    goodsOutTransactions: GoodsOutTransaction[];
    onAddGoodsOutTransaction: (
        transaction: Omit<GoodsOutTransaction, 'id' | 'items' | 'recordedBy'>,
        itemsToRecord: { name: string; unit: string; quantity: number }[]
    ) => boolean;
    onDeleteGoodsOutTransaction: (id: number) => void;
    stockSummary: StockSummaryItem[];
}

const StockLookupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    stockList: StockSummaryItem[];
    onSelect: (good: StockSummaryItem) => void;
}> = ({ isOpen, onClose, stockList, onSelect }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Pilih Barang dari Stok</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" aria-label="Tutup">&times;</button>
                </header>
                <main className="p-4 overflow-y-auto">
                    {stockList.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {stockList.map(good => (
                                <li key={`${good.name}-${good.unit}`} className="flex justify-between items-center py-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">{good.name}</p>
                                        <p className="text-sm text-slate-500">Sisa Stok: {good.stock} {good.unit}</p>
                                    </div>
                                    <button onClick={() => onSelect(good)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                                        Pilih
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-8">Barang tidak ditemukan atau stok kosong.</p>
                    )}
                </main>
            </div>
        </div>
    );
};


const ExpensesTab: React.FC<ExpensesTabProps> = ({ currencyFormatter, goodsOutTransactions, onAddGoodsOutTransaction, onDeleteGoodsOutTransaction, stockSummary }) => {
    // Form state for the main transaction/nota
    const [destination, setDestination] = useState('');
    const [transactionType, setTransactionType] = useState<'Penjualan' | 'Pemakaian Internal'>('Penjualan');

    // State for the list of items for the current nota
    const [currentItems, setCurrentItems] = useState<CurrentItem[]>([]);

    // Form state for a single item being added
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGood, setSelectedGood] = useState<StockSummaryItem | null>(null);
    const [outQuantity, setOutQuantity] = useState<number | ''>('');
    
    // State for lookup modal
    const [isLookupOpen, setIsLookupOpen] = useState(false);

    // State for accordion
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    const filteredStock = useMemo(() => {
        return stockSummary.filter(good =>
            good.name.toLowerCase().includes(searchTerm.toLowerCase()) && good.stock > 0
        );
    }, [searchTerm, stockSummary]);


    const handleSelectGood = (good: StockSummaryItem) => {
        setSelectedGood(good);
        setSearchTerm(''); // Clear search term after selection
        setIsLookupOpen(false); // Close modal
    };
    
    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGood && typeof outQuantity === 'number' && outQuantity > 0) {
            // Check if item already in the list
            if (currentItems.some(item => item.name === selectedGood.name && item.unit === selectedGood.unit)) {
                alert('Barang ini sudah ada di daftar. Hapus dulu jika ingin mengubah jumlah.');
                return;
            }
            if(outQuantity > selectedGood.stock) {
                alert(`Jumlah melebihi stok yang tersedia (${selectedGood.stock} ${selectedGood.unit}).`);
                return;
            }
            
            const newItem: CurrentItem = {
                ...selectedGood,
                quantity: outQuantity,
            };
            setCurrentItems(prev => [...prev, newItem]);
            // Reset item form
            setSelectedGood(null);
            setOutQuantity('');
        }
    };
    
    const handleDeleteItem = (name: string, unit: string) => {
        setCurrentItems(prev => prev.filter(item => !(item.name === name && item.unit === unit)));
    };

    const handleSubmitTransaction = () => {
        if (destination && transactionType && currentItems.length > 0) {
            const itemsToRecord = currentItems.map(item => ({
                name: item.name,
                unit: item.unit,
                quantity: item.quantity
            }));
            const success = onAddGoodsOutTransaction({ destination, transactionType }, itemsToRecord);
            
            if (success) {
                // Reset main form
                setDestination('');
                setTransactionType('Penjualan');
                setCurrentItems([]);
            }
        }
    };
    
    const currentTransactionTotal = useMemo(() => {
        // Since price is based on FIFO, we can't calculate a definitive total here.
        // This is just an estimate for UI purposes.
        // The real value is calculated in App.tsx
        return "Nilai akan dihitung FIFO";
    }, [currentItems]);
    

    return (
        <>
            <StockLookupModal
                isOpen={isLookupOpen}
                onClose={() => setIsLookupOpen(false)}
                stockList={filteredStock}
                onSelect={handleSelectGood}
            />
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Catat Pengeluaran Barang (Nota Keluar)</h2>
                
                {/* Form for new transaction */}
                <div className="bg-slate-50 p-6 rounded-xl shadow-md mb-8 space-y-6">
                    {/* Nota Header */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-slate-700 px-2">Informasi Nota Keluar</legend>
                        <div>
                            <label htmlFor="nota-destination" className="block text-sm font-medium text-slate-700 mb-1">Tujuan / Pelanggan</label>
                            <input id="nota-destination" type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Contoh: Penjualan Tiket, Stok Kafe" className="w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" required />
                        </div>
                        <div>
                            <label htmlFor="nota-type" className="block text-sm font-medium text-slate-700 mb-1">Jenis Transaksi</label>
                            <select id="nota-type" value={transactionType} onChange={e => setTransactionType(e.target.value as 'Penjualan' | 'Pemakaian Internal')} className="w-full rounded-md border border-slate-300 p-2 shadow-sm bg-white focus:border-indigo-500 focus:ring-indigo-500 transition">
                                <option value="Penjualan">Penjualan</option>
                                <option value="Pemakaian Internal">Pemakaian Internal</option>
                            </select>
                        </div>
                    </fieldset>

                    {/* Add Item to Nota Form */}
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-slate-700 px-2">Rincian Barang</legend>
                        
                        {!selectedGood ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label htmlFor="search-good" className="block text-sm font-medium text-slate-700 mb-1">Cari Nama Barang</label>
                                    <input 
                                        id="search-good" 
                                        type="text" 
                                        value={searchTerm} 
                                        onChange={e => setSearchTerm(e.target.value)} 
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setIsLookupOpen(true); }}}
                                        placeholder="Ketik nama barang..." 
                                        className="w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" 
                                    />
                                </div>
                                <div>
                                    <button onClick={() => setIsLookupOpen(true)} className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        Cari Barang
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-3">
                                     <label className="block text-sm font-medium text-slate-700">Barang Terpilih</label>
                                     <div className="flex justify-between items-center p-2 bg-indigo-100 rounded-md">
                                        <p className="font-bold text-indigo-800">{selectedGood.name} ({selectedGood.unit})</p>
                                        <button type="button" onClick={() => setSelectedGood(null)} className="text-sm text-red-600 hover:text-red-800 font-semibold">Batal</button>
                                     </div>
                                </div>
                                <div>
                                     <label htmlFor="out-quantity" className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                                     <input id="out-quantity" type="number" value={outQuantity} onChange={(e) => setOutQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder="0" className="w-full rounded-md border border-slate-300 p-2 shadow-sm" min="1" max={selectedGood.stock} required autoFocus/>
                                </div>
                                <div className="md:col-span-4">
                                     <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Tambah Rincian</button>
                                </div>
                            </form>
                        )}
                        
                        {currentItems.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-slate-600 mb-2">Barang dalam Nota Keluar Saat Ini:</h4>
                                <ul className="bg-white rounded-lg shadow p-2 space-y-2">
                                    {currentItems.map(item => (
                                        <li key={`${item.name}-${item.unit}`} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                                            <div>
                                                <span className="font-medium text-slate-800">{item.name}</span>
                                                <span className="text-sm text-slate-500 block">{`${item.quantity} ${item.unit}`}</span>
                                            </div>
                                            <button onClick={() => handleDeleteItem(item.name, item.unit)} className="text-red-500 hover:text-red-700 font-bold" aria-label={`Hapus ${item.name}`}>&times;</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between items-center bg-slate-200 p-3 rounded-b-lg font-bold text-slate-800 mt-2">
                                    <span>Total Nilai Nota</span>
                                    <span>{currentTransactionTotal}</span>
                                </div>
                            </div>
                        )}
                    </fieldset>
                    
                    <button 
                        onClick={handleSubmitTransaction} 
                        disabled={!destination || currentItems.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Simpan Nota Keluar
                    </button>
                </div>

                {/* List of existing transactions */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Daftar Pengeluaran (Nota Keluar)</h3>
                    <div className="space-y-4">
                        {goodsOutTransactions.length === 0 ? (
                            <p className="text-slate-500 text-center py-6 bg-slate-50 rounded-lg">Belum ada nota keluar yang dicatat.</p>
                        ) : (
                            goodsOutTransactions
                                .slice()
                                .sort((a, b) => b.id - a.id)
                                .map(tx => {
                                    const totalValue = tx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                    const isOpen = openAccordion === tx.id;

                                    return (
                                        <div key={tx.id} className="bg-white rounded-lg shadow-md transition-all duration-300">
                                            <div
                                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 rounded-t-lg"
                                                onClick={() => setOpenAccordion(isOpen ? null : tx.id)}
                                                aria-expanded={isOpen}
                                                aria-controls={`nota-details-${tx.id}`}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{tx.destination}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {new Date(tx.id).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                            <span className="mx-2 text-slate-300">|</span>
                                                            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded">ID: {tx.id}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-red-600">-{currencyFormatter(totalValue)}</p>
                                                    <p className="text-xs text-slate-500">Dicatat oleh: {tx.recordedBy}</p>
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div id={`nota-details-${tx.id}`} className="border-t border-slate-200 p-4 bg-white rounded-b-lg">
                                                    <h4 className="font-semibold text-slate-700 mb-3">Rincian Barang Keluar:</h4>
                                                    <ul className="space-y-2 mb-4">
                                                        {tx.items.map(item => (
                                                            <li key={item.transactionItemId} className="flex justify-between items-center text-sm">
                                                                <div>
                                                                    <p className="text-slate-800">{item.name}</p>
                                                                    <p className="text-xs text-slate-500">{`${item.quantity} ${item.unit} @ ${currencyFormatter(item.price)} (dari nota ${item.sourceRecordId})`}</p>
                                                                </div>
                                                                <p className="font-semibold text-slate-700">{currencyFormatter(item.price * item.quantity)}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-100">
                                                         <button
                                                            onClick={() => onDeleteGoodsOutTransaction(tx.id)}
                                                            className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                            aria-label={`Hapus nota ke ${tx.destination}`}
                                                        >
                                                            Hapus Nota Keluar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExpensesTab;