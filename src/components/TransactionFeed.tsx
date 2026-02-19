import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types/transaction';
import { TransactionCard } from './TransactionCard';
import { TransactionModal } from './TransactionModal';
import { generateTransaction, generateInitialTransactions } from '../data/mockTransactions';

const MAX_TRANSACTIONS = 50;
const MIN_INTERVAL = 2000;
const MAX_INTERVAL = 8000;

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransactionIds, setNewTransactionIds] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate initial transactions on mount
  useEffect(() => {
    const initial = generateInitialTransactions(8);
    setTransactions(initial);
  }, []);

  // Auto-generate new transactions at random intervals
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const addTransaction = () => {
      const newTx = generateTransaction();

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        // Keep only the most recent transactions
        return updated.slice(0, MAX_TRANSACTIONS);
      });

      // Mark as new for animation
      setNewTransactionIds((prev) => new Set(prev).add(newTx.id));

      // Remove "new" flag after animation completes
      setTimeout(() => {
        setNewTransactionIds((prev) => {
          const updated = new Set(prev);
          updated.delete(newTx.id);
          return updated;
        });
      }, 600);

      // Schedule next transaction
      const nextInterval = Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL;
      timeoutId = setTimeout(addTransaction, nextInterval);
    };

    // Start the auto-generation after a short delay
    timeoutId = setTimeout(addTransaction, 1500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleTransactionClick = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-500">Live Feed</span>
        </div>
        <h1 className="text-2xl font-bold text-visa-navy">
          Lending Transactions
        </h1>
        <p className="text-gray-500 mt-1">
          Click any transaction to see details
        </p>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-pulse">Loading transactions...</div>
          </div>
        ) : (
          transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onClick={handleTransactionClick}
              isNew={newTransactionIds.has(tx.id)}
            />
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-center text-sm text-gray-400">
          Showing {transactions.length} recent transactions
        </p>
      </div>

      {/* Modal */}
      <TransactionModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
