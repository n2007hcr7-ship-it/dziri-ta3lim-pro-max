import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { Transaction } from '../types';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, CreditCard, History, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const Wallet: React.FC = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    });
    return () => unsubscribe();
  }, [profile]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !amount) return;
    setLoading(true);
    try {
      // In a real app, this would redirect to a payment gateway (BaridiMob/Edahabia)
      // Here we simulate a successful deposit
      const transData = {
        userId: profile.uid,
        type: 'deposit',
        amount: parseFloat(amount),
        description: 'شحن رصيد عبر البطاقة الذهبية',
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'transactions'), transData);
      await updateDoc(doc(db, 'users', profile.uid), {
        walletBalance: increment(parseFloat(amount))
      });
      setShowDeposit(false);
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Balance Card */}
      <div className="bg-dz-green rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-dz-white/70 font-medium">الرصيد الحالي</p>
            <h1 className="text-5xl font-bold">{profile?.walletBalance || 0} <span className="text-2xl">دج</span></h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDeposit(true)}
              className="bg-white text-dz-green px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all"
            >
              <Plus size={20} />
              شحن الرصيد
            </button>
            {profile?.role === 'teacher' && (
              <button className="bg-dz-green border-2 border-white/20 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                <ArrowUpCircle size={20} />
                سحب الأرباح
              </button>
            )}
          </div>
        </div>
        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <WalletIcon size={200} />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dz-card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="font-bold">البطاقة الذهبية</h3>
            <p className="text-xs text-gray-500">شحن فوري وآمن</p>
          </div>
        </div>
        <div className="dz-card flex items-center gap-4">
          <div className="w-12 h-12 bg-dz-green/5 text-dz-green rounded-xl flex items-center justify-center font-bold">
            BM
          </div>
          <div>
            <h3 className="font-bold">بريدي موب</h3>
            <p className="text-xs text-gray-500">تحويل عبر تطبيق بريد الجزائر</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History size={24} />
          سجل العمليات
        </h2>
        <div className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <div key={t.id} className="dz-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'deposit' || t.type === 'earning' ? 'bg-dz-green/10 text-dz-green' : 'bg-dz-red/10 text-dz-red'
                  }`}>
                    {t.type === 'deposit' || t.type === 'earning' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t.description}</h4>
                    <p className="text-[10px] text-gray-400">
                      {format(new Date(t.createdAt), 'PPP p', { locale: ar })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${
                  t.type === 'deposit' || t.type === 'earning' ? 'text-dz-green' : 'text-dz-red'
                }`}>
                  {t.type === 'deposit' || t.type === 'earning' ? '+' : '-'}{t.amount} دج
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">لا توجد عمليات سابقة</div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center">شحن الرصيد</h2>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">المبلغ (دج)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dz-input text-center text-2xl font-bold"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowDeposit(false)}
                  className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="dz-btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'جاري الشحن...' : 'تأكيد الشحن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
