
import React, { useState, useMemo, useCallback } from 'react';
import { BILL_DENOMINATIONS, COIN_DENOMINATIONS } from './constants';
import DenominationRow from './components/DenominationRow';

const initialQuantities = [...BILL_DENOMINATIONS, ...COIN_DENOMINATIONS].reduce((acc, denomination) => {
  acc[denomination] = 0;
  return acc;
}, {} as Record<number, number>);

const App: React.FC = () => {
  const [quantities, setQuantities] = useState<Record<number, number>>(initialQuantities);
  const [systemAmount, setSystemAmount] = useState<number>(0);

  const currencyFormatter = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const handleQuantityChange = useCallback((denomination: number, quantity: number) => {
    setQuantities(prev => ({ ...prev, [denomination]: quantity }));
  }, []);
  
  const handleSystemAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? 0 : parseInt(e.target.value.replace(/\./g, ''), 10);
      setSystemAmount(isNaN(value) ? 0 : value);
  };

  const handleReset = () => {
    setQuantities(initialQuantities);
    setSystemAmount(0);
  };

  const totalPhysicalCash = useMemo(() => {
    return Object.entries(quantities).reduce((total, [denomination, quantity]) => {
      return total + Number(denomination) * quantity;
    }, 0);
  }, [quantities]);

  const difference = useMemo(() => totalPhysicalCash - systemAmount, [totalPhysicalCash, systemAmount]);

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-slate-800';
  };
  
  const formattedSystemAmount = useMemo(() => {
    return new Intl.NumberFormat('id-ID').format(systemAmount);
  }, [systemAmount]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 font-sans">
      <main className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Aplikasi Cash Opname</h1>
          <p className="text-slate-500 mt-1">Taman Kyai Langgeng - Magelang</p>
        </header>

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
                    <DenominationRow
                      key={denom}
                      denomination={denom}
                      quantity={quantities[denom] || 0}
                      onQuantityChange={handleQuantityChange}
                      currencyFormatter={currencyFormatter}
                    />
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
                    <DenominationRow
                      key={denom}
                      denomination={denom}
                      quantity={quantities[denom] || 0}
                      onQuantityChange={handleQuantityChange}
                      currencyFormatter={currencyFormatter}
                    />
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
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <span className="font-medium text-slate-600">Total Uang Fisik</span>
                    <span className="font-bold text-lg text-indigo-600">{currencyFormatter(totalPhysicalCash)}</span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                      <label htmlFor="system-amount" className="block font-medium text-slate-600 mb-2">Saldo Sistem</label>
                      <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                          <input
                              id="system-amount"
                              type="text"
                              value={systemAmount === 0 ? '' : formattedSystemAmount}
                              onChange={handleSystemAmountChange}
                              placeholder="0"
                              className="w-full rounded-md border border-slate-300 p-2 pl-8 text-right font-semibold text-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                          />
                      </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <span className="font-medium text-slate-600">Selisih</span>
                    <span className={`font-bold text-lg ${getDifferenceColor(difference)}`}>
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
                onClick={handleReset}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
