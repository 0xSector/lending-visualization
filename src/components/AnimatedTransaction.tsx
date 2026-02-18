import { useState, useEffect } from 'react';
import type { Transaction, ActionType } from '../types/transaction';
import { NetworkBadge } from './NetworkBadge';
import { getShortSummary } from '../utils/humanize';
import { formatAmount } from '../utils/formatters';

interface AnimatedTransactionProps {
  transaction: Transaction;
  phase: 'entering' | 'centered' | 'exiting' | 'done';
  onComplete: () => void;
  onClick: () => void;
  globeSize: number;
}

const ACTION_ICONS: Record<ActionType, { icon: string; bgColor: string; textColor: string }> = {
  supply: { icon: '+', bgColor: 'bg-green-500', textColor: 'text-white' },
  borrow: { icon: '-', bgColor: 'bg-blue-500', textColor: 'text-white' },
  repay: { icon: '↩', bgColor: 'bg-purple-500', textColor: 'text-white' },
  withdraw: { icon: '↑', bgColor: 'bg-orange-500', textColor: 'text-white' },
  liquidation: { icon: '!', bgColor: 'bg-red-500', textColor: 'text-white' },
};

export function AnimatedTransaction({
  transaction,
  phase,
  onComplete,
  onClick,
  globeSize,
}: AnimatedTransactionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconConfig = ACTION_ICONS[transaction.action];
  const summary = getShortSummary(transaction);

  useEffect(() => {
    if (phase === 'exiting') {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const getTransformStyle = () => {
    const centerX = 0;
    const centerY = 0;

    switch (phase) {
      case 'entering':
        return {
          transform: `translate(${globeSize * 0.6}px, ${-globeSize * 0.3}px) scale(0.5)`,
          opacity: 0,
        };
      case 'centered':
        return {
          transform: `translate(${centerX}px, ${centerY}px) scale(1)`,
          opacity: 1,
        };
      case 'exiting':
        return {
          transform: `translate(${-globeSize * 0.6}px, ${globeSize * 0.3}px) scale(0.5)`,
          opacity: 0,
        };
      default:
        return {
          transform: `translate(${centerX}px, ${centerY}px) scale(1)`,
          opacity: 0,
        };
    }
  };

  const style = getTransformStyle();

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      style={{
        ...style,
        transition: phase === 'entering' || phase === 'exiting'
          ? 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'all 0.3s ease',
      }}
    >
      {/* Transaction Card */}
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          bg-white rounded-xl shadow-2xl p-4 cursor-pointer
          border-2 transition-all duration-200
          min-w-[280px] max-w-[320px]
          ${isHovered ? 'border-visa-blue scale-105 shadow-visa-blue/20' : 'border-transparent'}
          ${phase === 'centered' ? 'animate-pulse-subtle' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${iconConfig.bgColor} ${iconConfig.textColor}
              font-bold text-lg shadow-lg
            `}
          >
            {iconConfig.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-visa-navy capitalize">
                {transaction.action}
              </span>
              <NetworkBadge network={transaction.network} />
            </div>
            <p className="text-xs text-gray-400">Click for details</p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gray-50 rounded-lg p-3 mb-2">
          <p className="text-2xl font-bold text-visa-navy">
            {formatAmount(transaction.amount, transaction.asset)} <span className="text-visa-blue">{transaction.asset}</span>
          </p>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 truncate">
          {summary}
        </p>

        {/* Progress indicator when centered */}
        {phase === 'centered' && (
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-visa-blue rounded-full"
              style={{
                animation: 'progressBar 5s linear forwards',
              }}
            />
          </div>
        )}
      </div>

      {/* Animated trail effect */}
      {(phase === 'entering' || phase === 'exiting') && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`
              absolute w-2 h-2 rounded-full bg-visa-blue
              ${phase === 'entering' ? 'animate-trail-in' : 'animate-trail-out'}
            `}
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
