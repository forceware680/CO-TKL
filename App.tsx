import React, { useState, useMemo, useCallback } from 'react';
import CashOpnameTab from './components/CashOpnameTab';
import ExpensesTab from './components/ExpensesTab';
import GoodsInTab from './components/GoodsInTab';
import ReportTab from './components/ReportTab';
import AdminTab from './components/AdminTab'; // New
import Login from './components/Login'; // New
import { BILL_DENOMINATIONS, COIN_DENOMINATIONS } from './constants';

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'cashier';
}

export interface GoodItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface GoodsInRecord {
    id: number;
    date: string;
    supplier: string;
    items: GoodItem[];
    recordedBy: string; // New
}

// Represents a single line item within a GoodsOutTransaction
export interface GoodOutRecord {
    transactionItemId: number; // Unique ID for this line item
    name: string;
    quantity: number;
    unit: string;
    price: number;
    sourceRecordId: number; // ID of the GoodsInRecord
    sourceItemId: number;   // ID of the GoodItem within that record
}

// Represents a full "Nota Keluar" transaction
export interface GoodsOutTransaction {
    id: number; // Transaction ID (timestamp)
    destination: string;
    transactionType: 'Penjualan' | 'Pemakaian Internal';
    items: GoodOutRecord[];
    recordedBy: string;
}


const initialQuantities = [...BILL_DENOMINATIONS, ...COIN_DENOMINATIONS].reduce((acc, denomination) => {
  acc[denomination] = 0;
  return acc;
}, {} as Record<number, number>);


const App: React.FC = () => {
  // Auth State
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin', password: 'admin', name: 'Admin Utama', role: 'admin' }
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState<'opname' | 'expenses' | 'goods' | 'report' | 'admin'>('opname');
  
  // Cash Opname State
  const [quantities, setQuantities] = useState<Record<number, number>>(initialQuantities);
  const [systemSales, setSystemSales] = useState<number>(0);
  const [nonCashSales, setNonCashSales] = useState<number>(0);
  const [startingCash, setStartingCash] = useState<number>(0);

  // Goods In State
  const [goodsInRecords, setGoodsInRecords] = useState<GoodsInRecord[]>([]);

  // Goods Out State (now structured as transactions)
  const [goodsOutTransactions, setGoodsOutTransactions] = useState<GoodsOutTransaction[]>([]);

  const currencyFormatter = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Auth Handlers
  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('opname'); // Reset to default tab on logout
  };
  
  const handleAddUser = (user: Omit<User, 'id'>): boolean => {
      if (users.some(u => u.username === user.username)) {
          alert('Username sudah digunakan. Silakan pilih username lain.');
          return false;
      }
      const newUser: User = { ...user, id: Date.now() };
      setUsers(prev => [...prev, newUser]);
      return true;
  };
  
  const handleUpdateUser = (updatedUser: User): boolean => {
    if (users.some(u => u.username === updatedUser.username && u.id !== updatedUser.id)) {
        alert('Username sudah digunakan oleh pengguna lain.');
        return false;
    }
    setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    // Jika user mengedit profilnya sendiri, update juga currentUser
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    return true;
  };

  const handleDeleteUser = (id: number) => {
      if (currentUser?.id === id) {
          alert("Anda tidak dapat menghapus akun Anda sendiri.");
          return;
      }
      if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.")) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };


  const handleQuantityChange = useCallback((denomination: number, quantity: number) => {
    setQuantities(prev => ({ ...prev, [denomination]: quantity }));
  }, []);

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.")) {
        setQuantities(initialQuantities);
        setSystemSales(0);
        setNonCashSales(0);
        setStartingCash(0);
        setGoodsInRecords([]);
        setGoodsOutTransactions([]);
        setActiveTab('opname');
    }
  };

  const isRecordLocked = useCallback((recordId: number): boolean => {
    return goodsOutTransactions.some(tx => 
        tx.items.some(item => item.sourceRecordId === recordId)
    );
  }, [goodsOutTransactions]);

  // Goods In Handlers
  const handleAddGoodsInRecord = (record: Omit<GoodsInRecord, 'id' | 'recordedBy'>) => {
    if (!currentUser) return;
    const newRecord: GoodsInRecord = {
      id: Date.now(),
      ...record,
      recordedBy: currentUser.name,
    };
    setGoodsInRecords(prev => [...prev, newRecord]);
  };
  
  const handleDeleteGoodsInRecord = (id: number) => {
    if (isRecordLocked(id)) {
        alert("Gagal Menghapus! Nota ini tidak dapat dihapus karena sebagian atau seluruh barangnya sudah tercatat dalam pengeluaran. Harap hapus data pengeluaran terkait terlebih dahulu.");
        return;
    }
    if (window.confirm('Anda yakin ingin menghapus nota ini?')) {
        setGoodsInRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const handleUpdateGoodsInRecord = (updatedRecord: GoodsInRecord) => {
      if(isRecordLocked(updatedRecord.id)){
        alert("Gagal Menyimpan! Nota ini tidak dapat diedit karena sebagian atau seluruh barangnya sudah tercatat dalam pengeluaran. Harap hapus data pengeluaran terkait terlebih dahulu.");
        return;
      }
      setGoodsInRecords(prev => prev.map(record => record.id === updatedRecord.id ? updatedRecord : record));
  };


  // Goods Out Handlers - Transactional FIFO Logic
  const handleAddGoodsOutTransaction = (
      transaction: Omit<GoodsOutTransaction, 'id' | 'items' | 'recordedBy'>,
      itemsToRecord: { name: string; unit: string; quantity: number }[]
  ): boolean => {
      if (!currentUser || itemsToRecord.length === 0) return false;

      const allItemsIn = goodsInRecords.flatMap(record => record.items.map(item => ({...item, recordId: record.id })));
      const allItemsOut = goodsOutTransactions.flatMap(tx => tx.items);

      // 1. Validate stock for ALL items before processing
      for (const item of itemsToRecord) {
          const totalIn = allItemsIn
              .filter(g => g.name === item.name && g.unit === item.unit)
              .reduce((sum, g) => sum + g.quantity, 0);

          const totalOut = allItemsOut
              .filter(g => g.name === item.name && g.unit === item.unit)
              .reduce((sum, g) => sum + g.quantity, 0);

          const availableStock = totalIn - totalOut;

          if (item.quantity > availableStock) {
              alert(`Transaksi Gagal! Stok tidak mencukupi untuk "${item.name} (${item.unit})". Sisa stok hanya ${availableStock} ${item.unit}.`);
              return false;
          }
      }
      
      // 2. Process FIFO for all items if validation passes
      const finalTransactionItems: GoodOutRecord[] = [];
      
      for (const itemToRecord of itemsToRecord) {
          const ledger = allItemsIn
              .filter(g => g.name === itemToRecord.name && g.unit === itemToRecord.unit)
              .sort((a, b) => a.recordId - b.recordId)
              .map(g => ({ id: g.id, recordId: g.recordId, price: g.price, remainingQty: g.quantity }));

          // Deplete ledger with existing outs
          for (const gOut of allItemsOut.filter(g => g.name === itemToRecord.name && g.unit === itemToRecord.unit)) {
              const sourceBatch = ledger.find(b => b.recordId === gOut.sourceRecordId && b.id === gOut.sourceItemId);
              if (sourceBatch) {
                  sourceBatch.remainingQty -= Math.min(sourceBatch.remainingQty, gOut.quantity);
              }
          }

          let remainingQuantityToRecord = itemToRecord.quantity;
          for (const batch of ledger) {
              if (remainingQuantityToRecord <= 0) break;
              if (batch.remainingQty <= 0) continue;

              const takeFromThisBatch = Math.min(batch.remainingQty, remainingQuantityToRecord);
              
              finalTransactionItems.push({
                  transactionItemId: Date.now() + finalTransactionItems.length,
                  name: itemToRecord.name,
                  quantity: takeFromThisBatch,
                  unit: itemToRecord.unit,
                  price: batch.price,
                  sourceRecordId: batch.recordId,
                  sourceItemId: batch.id,
              });
              remainingQuantityToRecord -= takeFromThisBatch;
          }
      }
      
      // 3. Create and save the new transaction
      if (finalTransactionItems.length > 0) {
          const newTransaction: GoodsOutTransaction = {
              id: Date.now(),
              ...transaction,
              items: finalTransactionItems,
              recordedBy: currentUser.name
          };
          setGoodsOutTransactions(prev => [...prev, newTransaction]);
          return true;
      }
      
      return false; // Should not happen if validation is correct
  };


  const handleDeleteGoodsOutTransaction = (id: number) => {
      if(window.confirm('Anda yakin ingin menghapus nota pengeluaran ini? Stok akan dikembalikan.')) {
        setGoodsOutTransactions(prev => prev.filter(tx => tx.id !== id));
      }
  };

  // Memoized data for Expenses Tab (Current Stock)
  const stockSummaryForExpenses = useMemo(() => {
      const stockMap = new Map<string, { name: string; totalIn: number; totalOut: number; unit: string, price?: number }>();
      const allItemsIn = goodsInRecords.flatMap(record => record.items);
      const allItemsOut = goodsOutTransactions.flatMap(tx => tx.items);

      const getKey = (item: { name: string; unit: string }) => `${item.name}|${item.unit}`;

      allItemsIn.forEach(g => {
          const key = getKey(g);
          const existing = stockMap.get(key) || { name: g.name, totalIn: 0, totalOut: 0, unit: g.unit };
          existing.totalIn += g.quantity;
          existing.price = g.price; // Keep the last price for reference, not for calculation
          stockMap.set(key, existing);
      });

      allItemsOut.forEach(g => {
          const key = getKey(g);
          const existing = stockMap.get(key) || { name: g.name, totalIn: 0, totalOut: 0, unit: g.unit };
          existing.totalOut += g.quantity;
          stockMap.set(key, existing);
      });
      
      return Array.from(stockMap.values()).map(data => ({
          name: data.name,
          stock: data.totalIn - data.totalOut,
          unit: data.unit,
          price: data.price ?? 0,
      }));
  }, [goodsInRecords, goodsOutTransactions]);


  const renderTabContent = () => {
    switch(activeTab) {
      case 'opname':
        return <CashOpnameTab 
                  quantities={quantities}
                  onQuantityChange={handleQuantityChange}
                  currencyFormatter={currencyFormatter}
                  systemSales={systemSales}
                  setSystemSales={setSystemSales}
                  nonCashSales={nonCashSales}
                  setNonCashSales={setNonCashSales}
                  startingCash={startingCash}
                  setStartingCash={setStartingCash}
                  onReset={handleReset}
               />;
      case 'expenses':
        return <ExpensesTab 
                  currencyFormatter={currencyFormatter}
                  goodsOutTransactions={goodsOutTransactions}
                  onAddGoodsOutTransaction={handleAddGoodsOutTransaction}
                  onDeleteGoodsOutTransaction={handleDeleteGoodsOutTransaction}
                  stockSummary={stockSummaryForExpenses}
                />;
      case 'goods':
        return <GoodsInTab
                  goodsInRecords={goodsInRecords}
                  onAddGoodsInRecord={handleAddGoodsInRecord}
                  onDeleteGoodsInRecord={handleDeleteGoodsInRecord}
                  onUpdateGoodsInRecord={handleUpdateGoodsInRecord}
                  isRecordLocked={isRecordLocked}
                  currencyFormatter={currencyFormatter}
                />;
      case 'report':
        return <ReportTab
                    goodsInRecords={goodsInRecords}
                    goodsOutTransactions={goodsOutTransactions}
                    currencyFormatter={currencyFormatter}
                />;
      case 'admin':
        return currentUser?.role === 'admin' ? 
               <AdminTab 
                    users={users} 
                    currentUser={currentUser}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                /> : null;
      default:
        return null;
    }
  }

  const TabButton: React.FC<{tabName: 'opname' | 'expenses' | 'goods' | 'report' | 'admin', label: string}> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 md:flex-none px-4 py-2 text-sm md:text-base md:px-6 md:py-3 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
        activeTab === tabName
          ? 'bg-white text-indigo-600 shadow-sm'
          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
      }`}
    >
      {label}
    </button>
  );

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-2 sm:p-4">
      <main className="w-full max-w-5xl mx-auto">
        <header className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Aplikasi Kasir</h1>
                    <p className="text-slate-500 mt-1">Taman Kyai Langgeng - Magelang</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-600">Selamat datang,</p>
                    <p className="font-bold text-indigo-700">{currentUser.name}</p>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline mt-1">Logout</button>
                </div>
            </div>
        </header>
        
        <nav className="flex space-x-1 border-b border-slate-300">
           <TabButton tabName="opname" label="Cash Opname" />
           <TabButton tabName="expenses" label="Pengeluaran" />
           <TabButton tabName="goods" label="Pemasukan" />
           <TabButton tabName="report" label="Laporan" />
           {currentUser.role === 'admin' && <TabButton tabName="admin" label="Admin" />}
        </nav>

        <div className="bg-white rounded-b-2xl shadow-lg p-4 md:p-8">
            {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
