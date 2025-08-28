import React, { useState, useMemo, useEffect } from 'react';
import type { GoodsInRecord, GoodItem } from '../App';

interface GoodsInTabProps {
    goodsInRecords: GoodsInRecord[];
    onAddGoodsInRecord: (record: Omit<GoodsInRecord, 'id' | 'recordedBy'>) => void;
    onDeleteGoodsInRecord: (id: number) => void;
    onUpdateGoodsInRecord: (record: GoodsInRecord) => void;
    isRecordLocked: (id: number) => boolean;
    currencyFormatter: (amount: number) => string;
}

const EditRecordModal: React.FC<{
    record: GoodsInRecord;
    onClose: () => void;
    onSave: (updatedRecord: GoodsInRecord) => void;
    currencyFormatter: (amount: number) => string;
}> = ({ record, onClose, onSave, currencyFormatter }) => {
    const [editedRecord, setEditedRecord] = useState<GoodsInRecord>({ ...record, items: [...record.items] });

    // Form state for a single item being added
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [unit, setUnit] = useState('');
    const [price, setPrice] = useState<number | ''>('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && typeof quantity === 'number' && quantity > 0 && unit && typeof price === 'number' && price >= 0) {
            const newItem: GoodItem = { id: Date.now(), name, quantity, unit, price };
            setEditedRecord(prev => ({ ...prev, items: [...prev.items, newItem] }));
            // Reset item form
            setName(''); setQuantity(''); setUnit(''); setPrice('');
        }
    };

    const handleDeleteItem = (id: number) => {
        setEditedRecord(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const handleSave = () => {
        if (editedRecord.items.length === 0) {
            alert("Nota harus memiliki setidaknya satu rincian barang.");
            return;
        }
        onSave(editedRecord);
        onClose();
    };
    
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-bold text-slate-800">Edit Nota Pemasukan</h3>
                    <p className="text-sm text-slate-500">ID Nota: {record.id}</p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Nota Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-nota-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Nota</label>
                            <input id="edit-nota-date" type="date" value={editedRecord.date} onChange={e => setEditedRecord(prev => ({...prev, date: e.target.value}))} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="edit-nota-supplier" className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
                            <input id="edit-nota-supplier" type="text" value={editedRecord.supplier} onChange={e => setEditedRecord(prev => ({...prev, supplier: e.target.value}))} className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                    </div>
                    
                    {/* Rincian Barang */}
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-slate-700 px-2">Rincian Barang</legend>
                        {/* Current Items */}
                         <ul className="space-y-2 mb-4">
                            {editedRecord.items.map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md">
                                    <div>
                                        <p className="text-slate-800 font-medium">{item.name}</p>
                                        <p className="text-xs text-slate-500">{`${item.quantity} ${item.unit} @ ${currencyFormatter(item.price)}`}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <span className="font-semibold text-slate-700">{currencyFormatter(item.price * item.quantity)}</span>
                                       <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 font-bold text-xl leading-none" aria-label={`Hapus ${item.name}`}>&times;</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {/* Add new item form */}
                        <form onSubmit={handleAddItem} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-600">Nama Barang</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama" className="w-full text-sm rounded border border-slate-300 p-1.5" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Jumlah</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Jml" className="w-full text-sm rounded border border-slate-300 p-1.5" />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-slate-600">Satuan</label>
                                <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Pcs" className="w-full text-sm rounded border border-slate-300 p-1.5" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-600">Harga Satuan</label>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="Harga" className="w-full text-sm rounded border border-slate-300 p-1.5" />
                            </div>
                            <div className="col-span-2">
                                 <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded text-sm">Tambah</button>
                            </div>
                        </form>
                    </fieldset>
                </div>
                <div className="p-4 bg-slate-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold">Batal</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Simpan Perubahan</button>
                </div>
            </div>
        </div>
    );
};

const GoodsInTab: React.FC<GoodsInTabProps> = ({ goodsInRecords, onAddGoodsInRecord, onDeleteGoodsInRecord, onUpdateGoodsInRecord, isRecordLocked, currencyFormatter }) => {
    // Form state for the main record/nota
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [supplier, setSupplier] = useState('');
    
    // State for the list of items for the current nota
    const [currentItems, setCurrentItems] = useState<GoodItem[]>([]);

    // Form state for a single item being added
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [unit, setUnit] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    
    // State for editing modal
    const [editingRecord, setEditingRecord] = useState<GoodsInRecord | null>(null);
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);


    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && typeof quantity === 'number' && quantity > 0 && unit && typeof price === 'number' && price >= 0) {
            const newItem: GoodItem = {
                id: Date.now(),
                name,
                quantity,
                unit,
                price
            };
            setCurrentItems(prev => [...prev, newItem]);
            // Reset item form
            setName('');
            setQuantity('');
            setUnit('');
            setPrice('');
        }
    };

    const handleDeleteItem = (id: number) => {
        setCurrentItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmitRecord = () => {
        if (date && supplier && currentItems.length > 0) {
            onAddGoodsInRecord({ date, supplier, items: currentItems });
            // Reset main form
            setDate(new Date().toISOString().split('T')[0]);
            setSupplier('');
            setCurrentItems([]);
        }
    };

    const currentRecordTotal = useMemo(() => {
        return currentItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [currentItems]);

    return (
        <div className="max-w-4xl mx-auto">
            {editingRecord && (
                <EditRecordModal 
                    record={editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSave={onUpdateGoodsInRecord}
                    currencyFormatter={currencyFormatter}
                />
            )}
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Catat Pemasukan Barang (Nota)</h2>
            
            {/* Form for new record */}
            <div className="bg-slate-50 p-6 rounded-xl shadow-md mb-8 space-y-6">
                {/* Nota Header */}
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg">
                    <legend className="text-lg font-semibold text-slate-700 px-2">Informasi Nota</legend>
                    <div>
                        <label htmlFor="nota-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Nota</label>
                        <input id="nota-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" required />
                    </div>
                    <div>
                        <label htmlFor="nota-supplier" className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier/Rekanan</label>
                        <input id="nota-supplier" type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Contoh: PT. Sinar Jaya" className="w-full rounded-md border border-slate-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" required />
                    </div>
                </fieldset>

                {/* Add Item to Nota Form */}
                <fieldset className="border p-4 rounded-lg">
                    <legend className="text-lg font-semibold text-slate-700 px-2">Rincian Barang</legend>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2 lg:col-span-2">
                            <label htmlFor="item-name" className="block text-sm font-medium text-slate-700 mb-1">Nama Barang</label>
                            <input id="item-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tiket Anak" className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div>
                             <label htmlFor="item-quantity" className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                             <input id="item-quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder="100" className="w-full rounded-md border border-slate-300 p-2 shadow-sm" min="1" required />
                        </div>
                        <div>
                             <label htmlFor="item-unit" className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                             <input id="item-unit" type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Pcs" className="w-full rounded-md border border-slate-300 p-2 shadow-sm" required />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2">
                             <label htmlFor="item-price" className="block text-sm font-medium text-slate-700 mb-1">Harga Satuan (Rp)</label>
                             <input id="item-price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder="15000" className="w-full rounded-md border border-slate-300 p-2 shadow-sm" min="0" required />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                             <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">Tambah Rincian</button>
                        </div>
                    </form>
                    
                    {/* Current Items List */}
                    {currentItems.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-slate-600 mb-2">Barang dalam Nota Saat Ini:</h4>
                            <ul className="bg-white rounded-lg shadow p-2 space-y-2">
                                {currentItems.map(item => (
                                    <li key={item.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                                        <div>
                                            <span className="font-medium text-slate-800">{item.name}</span>
                                            <span className="text-sm text-slate-500 block">{`${item.quantity} ${item.unit} x ${currencyFormatter(item.price)}`}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold text-slate-800">{currencyFormatter(item.price * item.quantity)}</span>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 font-bold" aria-label={`Hapus ${item.name}`}>&times;</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between items-center bg-slate-200 p-3 rounded-b-lg font-bold text-slate-800 mt-2">
                                <span>Total Nota Saat Ini</span>
                                <span>{currencyFormatter(currentRecordTotal)}</span>
                            </div>
                        </div>
                    )}
                </fieldset>
                
                {/* Submit Record Button */}
                <button 
                    onClick={handleSubmitRecord} 
                    disabled={!date || !supplier || currentItems.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Simpan Nota Pemasukan
                </button>
            </div>

            {/* List of existing records */}
            <div className="mt-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Daftar Pemasukan (Nota)</h3>
                <div className="space-y-4">
                    {goodsInRecords.length === 0 ? (
                        <p className="text-slate-500 text-center py-6 bg-slate-50 rounded-lg">Belum ada nota pemasukan yang dicatat.</p>
                    ) : (
                        goodsInRecords
                            .slice()
                            .sort((a, b) => b.id - a.id)
                            .map(record => {
                                const totalValue = record.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const isLocked = isRecordLocked(record.id);
                                const isOpen = openAccordion === record.id;

                                return (
                                    <div key={record.id} className="bg-white rounded-lg shadow-md transition-all duration-300">
                                        {/* Accordion Header */}
                                        <div
                                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 rounded-t-lg"
                                            onClick={() => setOpenAccordion(isOpen ? null : record.id)}
                                            aria-expanded={isOpen}
                                            aria-controls={`nota-details-${record.id}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                <div>
                                                    <p className="font-bold text-slate-800">{record.supplier}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(record.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        <span className="mx-2 text-slate-300">|</span>
                                                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded">ID: {record.id}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-indigo-600">{currencyFormatter(totalValue)}</p>
                                                <p className="text-xs text-slate-500">Dicatat oleh: {record.recordedBy}</p>
                                            </div>
                                        </div>

                                        {/* Accordion Body */}
                                        {isOpen && (
                                            <div id={`nota-details-${record.id}`} className="border-t border-slate-200 p-4 bg-white rounded-b-lg">
                                                <h4 className="font-semibold text-slate-700 mb-3">Rincian Barang:</h4>
                                                <ul className="space-y-2 mb-4">
                                                    {record.items.map(item => (
                                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                                            <div>
                                                                <p className="text-slate-800">{item.name}</p>
                                                                <p className="text-xs text-slate-500">{`${item.quantity} ${item.unit} @ ${currencyFormatter(item.price)}`}</p>
                                                            </div>
                                                            <p className="font-semibold text-slate-700">{currencyFormatter(item.price * item.quantity)}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-100">
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => setEditingRecord(record)}
                                                            disabled={isLocked}
                                                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                                            aria-label={`Edit nota dari ${record.supplier}`}
                                                        >
                                                            Edit Nota
                                                        </button>
                                                        {isLocked && (
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                Nota terkunci karena barang sudah dikeluarkan.
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="relative group">
                                                        <button
                                                            onClick={() => onDeleteGoodsInRecord(record.id)}
                                                            disabled={isLocked}
                                                            className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
                                                            aria-label={`Hapus nota dari ${record.supplier}`}
                                                        >
                                                            Hapus Nota
                                                        </button>
                                                        {isLocked && (
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                Nota terkunci karena barang sudah dikeluarkan.
                                                            </span>
                                                        )}
                                                    </div>
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
    );
};

export default GoodsInTab;