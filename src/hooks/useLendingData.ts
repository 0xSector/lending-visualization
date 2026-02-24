/**
 * useLendingData Hook
 *
 * Fetches lending transactions from Allium API and implements a drip-feed
 * pattern for smooth visualization. Falls back to mock data when API is unavailable.
 *
 * Architecture:
 * - Polls Allium API every POLL_INTERVAL_MS (default: 5 minutes)
 * - Queues fetched transactions
 * - Drips one transaction every DRIP_INTERVAL_MS (default: 2.5 seconds)
 * - Maintains displayed transactions history for the table
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Transaction } from '../types/transaction';
import {
  isAlliumConfigured,
  fetchLendingEvents,
  fetchLendingEventsWithWindow,
  transformEvents,
} from '../services/allium';
import { generateTransaction } from '../data/mockTransactions';

// Configuration with environment variable overrides
const POLL_INTERVAL_MS = parseInt(import.meta.env.VITE_POLL_INTERVAL_MS || '300000', 10); // 5 minutes
const DRIP_INTERVAL_MS = parseInt(import.meta.env.VITE_DRIP_INTERVAL_MS || '2500', 10); // 2.5 seconds
const MAX_DISPLAYED_TRANSACTIONS = 50;
const INITIAL_FETCH_WINDOW_MINUTES = 10; // Fetch more data on initial load

export interface UseLendingDataResult {
  /** The latest transaction to animate (dripped from queue) */
  currentTransaction: Transaction | null;
  /** Transaction history for the table display */
  displayedTransactions: Transaction[];
  /** Whether the initial data fetch is in progress */
  isLoading: boolean;
  /** Whether using mock data instead of Allium */
  isUsingMockData: boolean;
  /** Number of transactions waiting in the queue */
  queueLength: number;
  /** Any error message from the last fetch attempt */
  error: string | null;
  /** Trigger a manual fetch (useful for retry) */
  refetch: () => Promise<void>;
}

export function useLendingData(): UseLendingDataResult {
  // Transaction queue waiting to be dripped
  const [queue, setQueue] = useState<Transaction[]>([]);
  // Currently animating transaction
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  // Transactions shown in the table
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Track if using mock data
  const [isUsingMockData, setIsUsingMockData] = useState(!isAlliumConfigured());

  // Ref to track all seen transaction IDs (prevents duplicates across fetches)
  const seenIdsRef = useRef<Set<string>>(new Set());
  // Ref to access current queue in intervals
  const queueRef = useRef<Transaction[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /**
   * Fetch transactions from Allium API
   */
  const fetchFromAllium = useCallback(async (windowMinutes?: number) => {
    if (!isAlliumConfigured()) {
      setIsUsingMockData(true);
      return;
    }

    try {
      const result = windowMinutes
        ? await fetchLendingEventsWithWindow(windowMinutes)
        : await fetchLendingEvents();

      if (!result.success) {
        console.error('Allium fetch error:', result.error);
        setError(result.error);
        // Fall back to mock data on error
        setIsUsingMockData(true);
        return;
      }

      // Transform and deduplicate
      const transactions = transformEvents(result.data);
      const newTransactions = transactions.filter(tx => !seenIdsRef.current.has(tx.id));

      // Track seen IDs
      newTransactions.forEach(tx => seenIdsRef.current.add(tx.id));

      // Add to queue (newest first, but we'll reverse for FIFO dripping)
      if (newTransactions.length > 0) {
        // Sort by timestamp ascending so older transactions animate first
        const sortedNew = [...newTransactions].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
        setQueue(prev => [...prev, ...sortedNew]);
        setError(null);
        setIsUsingMockData(false);
      }
    } catch (err) {
      console.error('Allium fetch exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsUsingMockData(true);
    }
  }, []);

  /**
   * Generate mock transaction when queue is empty or using mock mode
   */
  const generateMockTransaction = useCallback(() => {
    const tx = generateTransaction();
    return tx;
  }, []);

  /**
   * Manual refetch trigger
   */
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchFromAllium(INITIAL_FETCH_WINDOW_MINUTES);
    setIsLoading(false);
  }, [fetchFromAllium]);

  // Initial fetch on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchFromAllium(INITIAL_FETCH_WINDOW_MINUTES);
      setIsLoading(false);
    };
    init();
  }, [fetchFromAllium]);

  // Polling interval for fetching new data
  useEffect(() => {
    if (isUsingMockData) return;

    const interval = setInterval(() => {
      fetchFromAllium();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchFromAllium, isUsingMockData]);

  // Drip feed: emit one transaction at a time
  useEffect(() => {
    const drip = setInterval(() => {
      if (isUsingMockData) {
        // Generate mock transactions when not using Allium
        const mockTx = generateMockTransaction();
        setCurrentTransaction(mockTx);
        setDisplayedTransactions(prev => [mockTx, ...prev].slice(0, MAX_DISPLAYED_TRANSACTIONS));
      } else if (queueRef.current.length > 0) {
        // Drip from queue
        setQueue(prev => {
          if (prev.length === 0) return prev;
          const [next, ...rest] = prev;
          setCurrentTransaction(next);
          setDisplayedTransactions(prevDisplayed =>
            [next, ...prevDisplayed].slice(0, MAX_DISPLAYED_TRANSACTIONS)
          );
          return rest;
        });
      }
      // If queue is empty and not using mock, do nothing (wait for next poll)
    }, DRIP_INTERVAL_MS);

    return () => clearInterval(drip);
  }, [isUsingMockData, generateMockTransaction]);

  return {
    currentTransaction,
    displayedTransactions,
    isLoading,
    isUsingMockData,
    queueLength: queue.length,
    error,
    refetch,
  };
}
