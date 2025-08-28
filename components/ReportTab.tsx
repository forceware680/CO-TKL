import React, { useState, useMemo, useEffect } from 'react';
import type { GoodsInRecord, GoodsOutTransaction, GoodItem } from '../App';

type FilterType = 'all' | 'today' | 'this_month' | 'this_year' | 'custom';

const toISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const FilterButton: React.FC<{
    label: string;
    filter: FilterType;
    activeFilter: FilterType;
    onClick: (filter: FilterType) => void;
}> = ({ label, filter, activeFilter, onClick }) => (
    <button
        onClick={() => onClick(filter)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            activeFilter === filter
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);


const ReportTab: React.FC<{
    goodsInRecords: GoodsInRecord[];
    goodsOutTransactions: GoodsOutTransaction[];
    currencyFormatter: (amount: number) => string;
}> = ({ goodsInRecords, goodsOutTransactions, currencyFormatter }) => {

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    useEffect(() => {
        const now = new Date();
        if (activeFilter !== 'custom') {
            if (activeFilter === 'today') {
                setStartDate(toISODateString(now));
                setEndDate(toISODateString(now));
            } else if (activeFilter === 'this_month') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setStartDate(toISODateString(firstDay));
                setEndDate(toISODateString(lastDay));
            } else if (activeFilter === 'this_year') {
                const firstDay = new Date(now.getFullYear(), 0, 1);
                const lastDay = new Date(now.getFullYear(), 11, 31);
                setStartDate(toISODateString(firstDay));
                setEndDate(toISODateString(lastDay));
            } else if (activeFilter === 'all') {
                setStartDate('');
                setEndDate('');
            }
        }
    }, [activeFilter]);

    const { filteredTransactions, stockSummary } = useMemo(() => {
        const start = startDate ? new Date(startDate) : null;
        if(start) start.setHours(0,0,0,0);

        const end = endDate ? new Date(endDate) : null;
        if(end) end.setHours(23,59,59,999);

        // Calculate stock summary based on all transactions up to the end date
        const stockMap = new Map<string, { name: string; totalIn: number; totalOut: number; unit: string }>();
        const getKey = (item: { name: string; unit: string }) => `${item.name}|${item.unit}`;
        
        goodsInRecords.forEach(record => {
            if (!end || new Date(record.date) <= end) {
                record.items.forEach(item => {
                    const key = getKey(item);
                    const existing = stockMap.get(key) || { name: item.name, totalIn: 0, totalOut: 0, unit: item.unit };
                    existing.totalIn += item.quantity;
                    stockMap.set(key, existing);
                });
            }
        });
        
        goodsOutTransactions.forEach(tx => {
             if (!end || new Date(tx.id) <= end) {
                tx.items.forEach(item => {
                    const key = getKey(item);
                    const existing = stockMap.get(key) || { name: item.name, totalIn: 0, totalOut: 0, unit: item.unit };
                    existing.totalOut += item.quantity;
                    stockMap.set(key, existing);
                });
             }
        });

        const finalStockSummary = Array.from(stockMap.values()).map(data => ({
            name: data.name,
            stock: data.totalIn - data.totalOut,
            unit: data.unit,
        }));
        
        // Filter transactions for display
        const goodsInTxs = goodsInRecords
            .filter(r => {
                const recordDate = new Date(r.date);
                recordDate.setHours(0,0,0,0); // Treat date as start of day
                return (!start || recordDate >= start) && (!end || recordDate <= end);
            })
            .map(record => ({
                id: record.id,
                date: new Date(record.date).getTime(),
                type: 'Pemasukan Barang' as const,
                description: `Nota dari ${record.supplier}`,
                details: `${record.items.length} jenis barang`,
                value: record.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                isCredit: true,
                recordedBy: record.recordedBy,
                items: record.items, // Keep items for accordion
            }));

        const goodsOutTxs = goodsOutTransactions
            .filter(tx => {
                const recordDate = new Date(tx.id);
                return (!start || recordDate >= start) && (!end || recordDate <= end);
            })
            .map(tx => ({
                id: tx.id,
                date: tx.id,
                type: 'Pengeluaran Barang' as const,
                description: `Nota Keluar ke ${tx.destination}`,
                details: `${tx.items.length} jenis barang`,
                value: tx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                isCredit: false,
                recordedBy: tx.recordedBy,
                items: tx.items,
            }));

        const combined = [...goodsInTxs, ...goodsOutTxs].sort((a, b) => a.date - b.date);

        return { filteredTransactions: combined, stockSummary: finalStockSummary };

    }, [goodsInRecords, goodsOutTransactions, startDate, endDate]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        setActiveFilter('custom');
    };
    
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
        setActiveFilter('custom');
    };

    return (
        <div className="space-y-12">
            {/* Filter Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 text-center">Filter Laporan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-4 flex justify-center space-x-2 border rounded-lg p-2 bg-slate-200">
                        <FilterButton label="Semua" filter="all" activeFilter={activeFilter} onClick={setActiveFilter} />
                        <FilterButton label="Hari Ini" filter="today" activeFilter={activeFilter} onClick={setActiveFilter} />
                        <FilterButton label="Bulan Ini" filter="this_month" activeFilter={activeFilter} onClick={setActiveFilter} />
                        <FilterButton label="Tahun Ini" filter="this_year" activeFilter={activeFilter} onClick={setActiveFilter} />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                        <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                         <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                        <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} className="w-full rounded-md border-slate-300 shadow-sm text-sm" />
                    </div>
                </div>
            </div>

            {/* Stock Summary Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Stok Barang</h2>
                 <p className="text-center text-sm text-slate-500 -mt-4 mb-6">Posisi stok pada akhir periode terpilih</p>
                {stockSummary.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-lg">Belum ada data barang.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow max-w-2xl mx-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="p-3 text-left font-semibold text-slate-600">Nama Barang</th>
                                    <th className="p-3 text-right font-semibold text-slate-600">Sisa Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockSummary.sort((a,b) => a.name.localeCompare(b.name)).map(item => (
                                    <tr key={`${item.name}-${item.unit}`} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-800">{item.name}</td>
                                        <td className="p-3 text-right text-slate-700 font-semibold">{`${item.stock} ${item.unit}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Daily Mutation Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Rincian Mutasi</h2>
                 {filteredTransactions.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-lg">Tidak ada transaksi pada periode terpilih.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="p-3 text-left font-semibold text-slate-600">Tanggal & Waktu</th>
                                    <th className="p-3 text-left font-semibold text-slate-600">Jenis Transaksi</th>
                                    <th className="p-3 text-left font-semibold text-slate-600">Keterangan</th>
                                    <th className="p-3 text-left font-semibold text-slate-600">Dicatat Oleh</th>
                                    <th className="p-3 text-right font-semibold text-slate-600">Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(tx => (
                                    <React.Fragment key={tx.id}>
                                        <tr 
                                            onClick={() => tx.items && toggleRow(tx.id)}
                                            className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 ${tx.items ? 'cursor-pointer' : ''}`}
                                        >
                                            <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(tx.date).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.type === 'Pemasukan Barang' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="p-3 font-medium text-slate-800">
                                                <div className="flex items-center">
                                                    {tx.items && (
                                                        <svg className={`w-4 h-4 mr-2 text-slate-400 transition-transform ${expandedRows.has(tx.id) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                    )}
                                                    <div>
                                                        {tx.description}
                                                        <span className="block text-xs text-slate-500">{tx.details}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-slate-600">{tx.recordedBy}</td>
                                            <td className={`p-3 text-right font-bold ${tx.isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.isCredit ? '+' : '-'} {currencyFormatter(tx.value)}
                                            </td>
                                        </tr>
                                        {expandedRows.has(tx.id) && tx.items && (
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-4 ml-8">
                                                        <h4 className="font-semibold text-slate-700 mb-2 text-xs">Rincian Barang:</h4>
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-slate-300">
                                                                    <th className="py-1 px-2 text-left font-medium text-slate-500">Nama Barang</th>
                                                                    <th className="py-1 px-2 text-right font-medium text-slate-500">Jumlah</th>
                                                                    <th className="py-1 px-2 text-right font-medium text-slate-500">Harga Satuan</th>
                                                                    <th className="py-1 px-2 text-right font-medium text-slate-500">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(tx.items as (GoodItem[] | any[])).map((item, index) => (
                                                                    <tr key={item.id || item.transactionItemId || index}>
                                                                        <td className="py-1 px-2 text-slate-700">{item.name}</td>
                                                                        <td className="py-1 px-2 text-right text-slate-600">{item.quantity} {item.unit}</td>
                                                                        <td className="py-1 px-2 text-right text-slate-600">{currencyFormatter(item.price)}</td>
                                                                        <td className="py-1 px-2 text-right font-semibold text-slate-700">{currencyFormatter(item.price * item.quantity)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTab;
