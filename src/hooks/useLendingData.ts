/**
 * useLendingData Hook
 *
 * Drip-feeds lending transactions from static CSV data for smooth visualization.
 * Separates the "pending" transaction (for animation) from displayed transactions (in table).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Transaction } from '../types/transaction';
import { lendingTransactions } from '../data/lendingData';

// Configuration
const DRIP_INTERVAL_MS = parseInt(import.meta.env.VITE_DRIP_INTERVAL_MS || '3500', 10); // 3.5 seconds (gives time for orbit + settle)
const MAX_DISPLAYED_TRANSACTIONS = 50;

export interface UseLendingDataResult {
  /** The next transaction to animate (not yet in table) */
  pendingTransaction: Transaction | null;
  /** Transaction history for the table display */
  displayedTransactions: Transaction[];
  /** Call this when animation is complete to add pending transaction to table */
  commitTransaction: () => void;
  /** Whether the initial data fetch is in progress */
  isLoading: boolean;
  /** Whether using mock data instead of Allium (always false now - using real CSV data) */
  isUsingMockData: boolean;
  /** Number of transactions waiting in the queue */
  queueLength: number;
  /** Any error message from the last fetch attempt */
  error: string | null;
  /** Trigger a manual fetch (no-op for static data) */
  refetch: () => Promise<void>;
  // Legacy alias for compatibility
  currentTransaction: Transaction | null;
}

export function useLendingData(): UseLendingDataResult {
  // Transaction waiting to be animated
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
  // Transactions shown in the table (only after animation completes)
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Track if we're ready for next transaction
  const [readyForNext, setReadyForNext] = useState(true);

  // Index tracker for cycling through data
  const currentIndexRef = useRef(0);
  // Ref for pending transaction
  const pendingTxRef = useRef<Transaction | null>(null);
  pendingTxRef.current = pendingTransaction;

  // Initialize
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Get next transaction from the cycle
  const getNextTransaction = useCallback((): Transaction => {
    const index = currentIndexRef.current;
    const transaction = lendingTransactions[index];

    // Move to next, cycling back to start
    currentIndexRef.current = (index + 1) % lendingTransactions.length;

    // Return a copy with fresh timestamp and unique ID
    return {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date(),
    };
  }, []);

  // Commit the pending transaction to the table
  const commitTransaction = useCallback(() => {
    const tx = pendingTxRef.current;
    if (tx) {
      setDisplayedTransactions(prev =>
        [tx, ...prev].slice(0, MAX_DISPLAYED_TRANSACTIONS)
      );
      setPendingTransaction(null);
      setReadyForNext(true);
    }
  }, []);

  // Manual refetch (resets the cycle)
  const refetch = useCallback(async () => {
    setIsLoading(true);
    currentIndexRef.current = 0;
    setDisplayedTransactions([]);
    setPendingTransaction(null);
    setReadyForNext(true);
    setIsLoading(false);
  }, []);

  // Drip feed: emit one transaction at a time, only when ready
  useEffect(() => {
    if (isLoading) return;

    const drip = setInterval(() => {
      if (readyForNext && !pendingTxRef.current) {
        const nextTx = getNextTransaction();
        setPendingTransaction(nextTx);
        setReadyForNext(false);
      }
    }, DRIP_INTERVAL_MS);

    // Also trigger immediately on first load
    if (readyForNext && !pendingTransaction) {
      const nextTx = getNextTransaction();
      setPendingTransaction(nextTx);
      setReadyForNext(false);
    }

    return () => clearInterval(drip);
  }, [isLoading, readyForNext, pendingTransaction, getNextTransaction]);

  return {
    pendingTransaction,
    currentTransaction: pendingTransaction, // Legacy alias
    displayedTransactions,
    commitTransaction,
    isLoading,
    isUsingMockData: false,
    queueLength: lendingTransactions.length - currentIndexRef.current,
    error: null,
    refetch,
  };
}
