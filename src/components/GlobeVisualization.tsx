import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Transaction } from '../types/transaction';
import { Globe } from './Globe';
import { OrbitingDot } from './OrbitingDot';
import { TransactionTable } from './TransactionTable';
import { TransactionModal } from './TransactionModal';
import { generateTransaction } from '../data/mockTransactions';

type DotPhase = 'orbiting' | 'settling' | 'done';

interface PendingTransaction {
  transaction: Transaction;
  phase: DotPhase;
}

// Single orbit: 200° to -20° = 220° at 3° per 20ms ≈ 1.5 seconds
const ORBIT_DURATION = 1500;
const MAX_TRANSACTIONS = 25;

export function GlobeVisualization() {
  const [pendingTx, setPendingTx] = useState<PendingTransaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTxId, setNewTxId] = useState<string | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globeSize, setGlobeSize] = useState(450);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const pendingTxRef = useRef<PendingTransaction | null>(null);
  pendingTxRef.current = pendingTx;

  // Generate stable particle positions
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
    })),
  []);

  // Responsive globe sizing - LARGER
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        const width = containerRef.current.clientWidth;
        // Larger globe: up to 500px
        const size = Math.min(height * 0.7, width * 0.4, 500);
        setGlobeSize(Math.max(350, size));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate table position relative to globe container
  const tablePosition = useMemo(() => {
    // Position where the dot should fly to (top of table area)
    return {
      x: globeSize + 120,  // Right of globe
      y: globeSize / 2 - 180, // Near top of table
    };
  }, [globeSize]);

  // Start a new transaction (orbiting phase)
  const startNewTransaction = useCallback(() => {
    const newTx = generateTransaction();
    setPendingTx({ transaction: newTx, phase: 'orbiting' });

    // After single orbit, start settling
    setTimeout(() => {
      setPendingTx((prev) =>
        prev ? { ...prev, phase: 'settling' } : null
      );
    }, ORBIT_DURATION);
  }, []);

  // Handle when dot has settled into the table
  const handleDotSettled = useCallback(() => {
    const currentPendingTx = pendingTxRef.current;
    if (currentPendingTx) {
      const tx = currentPendingTx.transaction;
      setNewTxId(tx.id);
      setTransactions((prev) => [tx, ...prev].slice(0, MAX_TRANSACTIONS));
      setPendingTx(null);

      // Clear the "new" highlight after animation
      setTimeout(() => setNewTxId(undefined), 800);

      // Start next transaction
      setTimeout(startNewTransaction, 300);
    }
  }, [startNewTransaction]);

  // Start the animation cycle
  useEffect(() => {
    const timer = setTimeout(startNewTransaction, 800);
    return () => clearTimeout(timer);
  }, [startNewTransaction]);

  // Handle modal
  const handleTransactionClick = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[700px] flex"
    >
      {/* Animated background particles - blue accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center gap-16 px-8 py-6">
        {/* Left side - Globe */}
        <div className="flex flex-col items-center">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="font-display text-5xl italic text-[#1A1F71] mb-3 tracking-tight">
              Onchain Lending
            </h1>
            <p className="text-gray-400 text-sm tracking-[0.15em] uppercase font-mono">
              Global Activity • Real-time
            </p>
          </div>

          {/* Globe container */}
          <div
            ref={globeContainerRef}
            className="relative"
            style={{ width: globeSize, height: globeSize }}
          >
            {/* Globe glow - Visa light blue */}
            <div
              className="absolute rounded-full animate-glow"
              style={{
                background: 'radial-gradient(circle, rgba(0,161,224,0.15) 0%, rgba(0,161,224,0) 70%)',
                width: globeSize * 1.5,
                height: globeSize * 1.5,
                left: -globeSize * 0.25,
                top: -globeSize * 0.25,
              }}
            />

            {/* Globe */}
            <Globe size={globeSize} />

            {/* Orbiting Dot */}
            {pendingTx && (
              <OrbitingDot
                globeSize={globeSize}
                phase={pendingTx.phase}
                asset={pendingTx.transaction.asset}
                onSettled={handleDotSettled}
                tablePosition={tablePosition}
              />
            )}
          </div>

          {/* Stats - refined pill */}
          <div className="mt-10 flex items-center gap-4 text-xs bg-white shadow-sm border border-gray-100 px-5 py-2.5 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00A1E0] rounded-full animate-pulse" />
              <span className="text-[#00A1E0] font-medium tracking-wide uppercase text-[10px]">Live</span>
            </div>
            <div className="h-3 w-px bg-gray-200" />
            <div className="text-gray-500 font-mono">
              <span className="text-[#1A1F71] font-semibold">{transactions.length}</span>
              <span className="ml-1.5 text-[10px] tracking-wider">TXS</span>
            </div>
          </div>
        </div>

        {/* Right side - Transaction Table */}
        <div className="w-[620px] h-[650px] flex-shrink-0">
          <TransactionTable
            transactions={transactions}
            onTransactionClick={handleTransactionClick}
            newTransactionId={newTxId}
          />
        </div>
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
