import { useEffect } from 'react';
import type { TransactionModalProps, ActionType } from '../types/transaction';
import { NetworkBadge } from './NetworkBadge';
import { getDetailedSummary, getHealthStatus, getActionDescription } from '../utils/humanize';
import { truncateAddress, formatAmount, formatAPY, formatRelativeTime } from '../utils/formatters';

const ACTION_COLORS: Record<ActionType, { text: string; accent: string }> = {
  supply: { text: 'text-accent-emerald', accent: 'bg-accent-emerald' },
  borrow: { text: 'text-accent-cyan', accent: 'bg-accent-cyan' },
  repay: { text: 'text-accent-violet', accent: 'bg-accent-violet' },
  withdraw: { text: 'text-accent-amber', accent: 'bg-accent-amber' },
  liquidation: { text: 'text-accent-rose', accent: 'bg-accent-rose' },
};

export function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const summaries = getDetailedSummary(transaction);
  const healthStatus = getHealthStatus(transaction.healthFactor);
  const actionStyle = ACTION_COLORS[transaction.action];

  return (
    <div className="modal-backdrop z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="modal-content glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${actionStyle.accent} opacity-60`} />

          {/* Header */}
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`font-display text-2xl italic ${actionStyle.text}`}>
                  {transaction.action}
                </span>
                <NetworkBadge network={transaction.network} />
              </div>
              <button
                onClick={onClose}
                className="text-morpho-silver/60 hover:text-morpho-pearl transition-colors p-1 rounded-lg hover:bg-black/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-morpho-silver text-sm font-mono">
              {getActionDescription(transaction.action)}
            </p>
          </div>

          {/* Plain English Summary */}
          <div className="p-6 bg-morpho-charcoal/50">
            <h3 className="data-label mb-3">
              What Happened
            </h3>
            <div className="space-y-2">
              {summaries.map((summary, index) => (
                <p key={index} className="text-morpho-pearl/90 leading-relaxed text-sm">
                  {summary}
                </p>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="p-6">
            <h3 className="data-label mb-4">
              Transaction Details
            </h3>
            <div className="space-y-0">
              {/* Wallet */}
              <div className="flex justify-between items-center py-3 border-b border-black/5">
                <span className="text-morpho-silver text-sm">Wallet</span>
                <span className="font-mono text-sm text-morpho-pearl">
                  {truncateAddress(transaction.walletAddress)}
                </span>
              </div>

              {/* Asset & Amount */}
              <div className="flex justify-between items-center py-3 border-b border-black/5">
                <span className="text-morpho-silver text-sm">Amount</span>
                <span className="font-semibold text-morpho-pearl font-mono">
                  {formatAmount(transaction.amount, transaction.asset)} <span className="text-morpho-silver">{transaction.asset}</span>
                </span>
              </div>

              {/* APY */}
              {transaction.apy && (
                <div className="flex justify-between items-center py-3 border-b border-black/5">
                  <span className="text-morpho-silver text-sm">
                    {transaction.action === 'borrow' ? 'Borrow APY' : 'Supply APY'}
                  </span>
                  <span className="font-semibold text-accent-cyan font-mono">
                    {formatAPY(transaction.apy)}
                  </span>
                </div>
              )}

              {/* Market */}
              {transaction.marketName && (
                <div className="flex justify-between items-center py-3 border-b border-black/5">
                  <span className="text-morpho-silver text-sm">Market</span>
                  <span className="text-sm text-morpho-pearl font-mono">
                    {transaction.marketName}
                  </span>
                </div>
              )}

              {/* Health Factor */}
              {transaction.healthFactor && (
                <div className="flex justify-between items-center py-3 border-b border-black/5">
                  <span className="text-morpho-silver text-sm">Health Factor</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-morpho-pearl">{transaction.healthFactor.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      healthStatus.label === 'Healthy' ? 'bg-accent-emerald/15 text-accent-emerald' :
                      healthStatus.label === 'Warning' ? 'bg-accent-amber/15 text-accent-amber' :
                      'bg-accent-rose/15 text-accent-rose'
                    }`}>
                      {healthStatus.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex justify-between items-center py-3 border-b border-black/5">
                <span className="text-morpho-silver text-sm">Time</span>
                <span className="text-morpho-pearl text-sm font-mono">
                  {formatRelativeTime(transaction.timestamp)}
                </span>
              </div>

              {/* Network */}
              <div className="flex justify-between items-center py-3">
                <span className="text-morpho-silver text-sm">Network</span>
                <NetworkBadge network={transaction.network} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-morpho-charcoal/50 rounded-b-2xl">
            <a
              href="#"
              className="block w-full text-center py-3 px-4 bg-gradient-to-r from-accent-cyan to-accent-violet text-white rounded-xl font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                alert('Block explorer integration coming soon!');
              }}
            >
              View on Block Explorer
            </a>
            <p className="text-center text-morpho-silver/40 text-[10px] mt-3 font-mono tracking-wider">
              TX: {transaction.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
