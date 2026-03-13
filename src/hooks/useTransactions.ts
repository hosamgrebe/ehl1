import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Transaction, FundBalance } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString()
      })) as Transaction[];
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'balanceAfter'>) => {
    if (!user) return;

    // Calculate new balance
    const fundTxs = transactions.filter(t => t.fund === tx.fund);
    const currentBalance = fundTxs.length > 0 ? fundTxs[0].balanceAfter : 0;
    
    let newBalance = currentBalance;
    if (tx.type === 'deposit') newBalance += tx.amount;
    else newBalance -= tx.amount;

    const newTxData = {
      ...tx,
      uid: user.uid,
      timestamp: Timestamp.fromDate(new Date()),
      balanceAfter: newBalance,
    };

    try {
      await addDoc(collection(db, 'transactions'), newTxData);

      // Send Telegram notification (optional, depends on server.ts config)
      const message = `🔔 <b>عملية جديدة</b>\n\n` +
        `👤 المستخدم: ${user.displayName || user.email}\n` +
        `💰 المبلغ: ${tx.amount.toLocaleString()} ${tx.fund}\n` +
        `📝 النوع: ${tx.type === 'deposit' ? 'إيداع' : tx.type === 'withdrawal' ? 'سحب' : 'مصروف'}\n` +
        `📄 البيان: ${tx.note}\n` +
        `🏦 الرصيد الجديد: ${newBalance.toLocaleString()} ${tx.fund}`;
      
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }).catch(err => console.error("Notify error:", err));

    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const balances: FundBalance = {
    SYP: transactions.filter(t => t.fund === 'SYP')[0]?.balanceAfter || 0,
    USD: transactions.filter(t => t.fund === 'USD')[0]?.balanceAfter || 0,
  };

  return { transactions, balances, loading, addTransaction };
}
