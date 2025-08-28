import React, { useMemo } from 'react';
import { BILL_DENOMINATIONS, COIN_DENOMINATIONS } from '../constants';
import DenominationRow from './DenominationRow';

interface CashOpnameTabProps {
    quantities: Record<number, number>;
    onQuantityChange: (denomination: number, quantity: number) => void;
    currencyFormatter: (amount: number) => string;
    systemSales: number;
    setSystemSales: (value: number) => void;
    nonCashSales: number;
    setNonCashSales: (value: number) => void;
    startingCash: number;
    setStartingCash: (value: number) => void;
    onReset: () => void;
}

const NumberInput: React.FC<{
    label: string;
    id: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ label, id, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === '' ? 0 : parseInt(e.target.value.replace(/\./g, ''), 10);
        onChange(isNaN(val) ? 0 : val);
    };

    const formattedValue = useMemo(() => {
      return new Intl.NumberFormat('id-ID').format(value);
    }, [value]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor={id} className="block font-medium text-slate-600 mb-2">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                <input
                    id={id}
                    type="text"
                    value={value === 0 ? '' : formattedValue}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 p-2 pl-8 text-right font-semibold text-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                />
            </div>
        </div>
    );
};

const SummaryRow: React.FC<{label: string, value: string, color?: string, isBold?: boolean}> = ({ label, value, color = 'text-indigo-600', isBold = true }) => (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className={`${isBold ? 'font-bold' : 'font-semibold'} text-lg ${color}`}>{value}</span>
    </div>
);

const CashOpnameTab: React.FC<CashOpnameTabProps> = ({
    quantities,
    onQuantityChange,
    currencyFormatter,
    systemSales,
    setSystemSales,
    nonCashSales,
    setNonCashSales,
    startingCash,
    setStartingCash,
    onReset
}) => {
    const totalPhysicalCash = useMemo(() => {
        return Object.entries(quantities).reduce((total, [denomination, quantity]) => {
            return total + Number(denomination) * quantity;
        }, 0);
    }, [quantities]);

    const cashSales = useMemo(() => systemSales - nonCashSales, [systemSales, nonCashSales]);
    const expectedCashInDrawer = useMemo(() => startingCash + cashSales, [startingCash, cashSales]);
    const difference = useMemo(() => totalPhysicalCash - expectedCashInDrawer, [totalPhysicalCash, expectedCashInDrawer]);

    const getDifferenceColor = (diff: number) => {
        if (diff > 0) return 'text-green-600';
        if (diff < 0) return 'text-red-600';
        return 'text-slate-800';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Denominations Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-3">Uang Kertas</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 text-left text-sm font-medium text-slate-500">Denominasi</th>
                                <th className="p-2 text-center text-sm font-medium text-slate-500">Jumlah Lembar</th>
                                <th className="p-2 text-right text-sm font-medium text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {BILL_DENOMINATIONS.map(denom => (
                                <DenominationRow key={denom} denomination={denom} quantity={quantities[denom] || 0} onQuantityChange={onQuantityChange} currencyFormatter={currencyFormatter} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-3">Uang Logam</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 text-left text-sm font-medium text-slate-500">Denominasi</th>
                                <th className="p-2 text-center text-sm font-medium text-slate-500">Jumlah Keping</th>
                                <th className="p-2 text-right text-sm font-medium text-slate-500">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COIN_DENOMINATIONS.map(denom => (
                                <DenominationRow key={denom} denomination={denom} quantity={quantities[denom] || 0} onQuantityChange={onQuantityChange} currencyFormatter={currencyFormatter} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Section */}
            <div className="bg-slate-50 rounded-xl p-6 flex flex-col justify-between h-full">
                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center">Rekapitulasi</h2>
                    <div className="space-y-4">
                        <NumberInput label="Modal Awal" id="starting-cash" value={startingCash} onChange={setStartingCash} />
                        <NumberInput label="Total Penjualan Sistem" id="system-sales" value={systemSales} onChange={setSystemSales} />
                        <NumberInput label="Penjualan Non-Tunai (QRIS, dll)" id="non-cash-sales" value={nonCashSales} onChange={setNonCashSales} />
                        
                        <hr className="my-4 border-slate-200" />
                        
                        <SummaryRow label="Penjualan Tunai" value={currencyFormatter(cashSales)} color="text-slate-800" />
                        <SummaryRow label="Uang di Laci (Sistem)" value={currencyFormatter(expectedCashInDrawer)} color="text-blue-600" />
                        <SummaryRow label="Total Uang Fisik" value={currencyFormatter(totalPhysicalCash)} />

                        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-t-4 border-indigo-500">
                            <span className="font-bold text-slate-700 text-lg">Selisih</span>
                            <span className={`font-bold text-xl ${getDifferenceColor(difference)}`}>
                                {currencyFormatter(difference)}
                                <span className="text-sm font-normal ml-2">
                                    {difference > 0 ? '(Lebih)' : difference < 0 ? '(Kurang)' : ''}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onReset}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                        Reset Semua Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashOpnameTab;