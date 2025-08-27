
import React from 'react';

interface DenominationRowProps {
  denomination: number;
  quantity: number;
  onQuantityChange: (denomination: number, quantity: number) => void;
  currencyFormatter: (amount: number) => string;
}

const DenominationRow: React.FC<DenominationRowProps> = ({ denomination, quantity, onQuantityChange, currencyFormatter }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    onQuantityChange(denomination, Math.max(0, value)); // Ensure non-negative
  };

  const subtotal = denomination * quantity;

  return (
    <tr className="border-b border-slate-200">
      <td className="p-3 text-slate-700 font-medium text-left">
        {currencyFormatter(denomination)}
      </td>
      <td className="p-3">
        <input
          type="number"
          value={quantity === 0 ? '' : quantity}
          onChange={handleInputChange}
          placeholder="0"
          className="w-full rounded-md border border-slate-300 p-2 text-center shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
          min="0"
        />
      </td>
      <td className="p-3 text-slate-800 font-semibold text-right w-48">
        {currencyFormatter(subtotal)}
      </td>
    </tr>
  );
};

export default DenominationRow;
