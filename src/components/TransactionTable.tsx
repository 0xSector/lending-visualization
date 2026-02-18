import type { Transaction, ActionType } from '../types/transaction';
import { NetworkBadge } from './NetworkBadge';
import { formatAmount, formatRelativeTime, truncateAddress } from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  newTransactionId?: string;
}

const ACTION_CONFIG: Record<ActionType, { icon: string; color: string; bg: string; glow: string }> = {
  supply: { icon: '+', color: 'text-accent-emerald', bg: 'bg-accent-emerald/15', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]' },
  borrow: { icon: '−', color: 'text-accent-cyan', bg: 'bg-accent-cyan/15', glow: 'shadow-[0_0_12px_rgba(0,229,204,0.3)]' },
  repay: { icon: '↩', color: 'text-accent-violet', bg: 'bg-accent-violet/15', glow: 'shadow-[0_0_12px_rgba(157,122,255,0.3)]' },
  withdraw: { icon: '↑', color: 'text-accent-amber', bg: 'bg-accent-amber/15', glow: 'shadow-[0_0_12px_rgba(255,181,71,0.3)]' },
  liquidation: { icon: '!', color: 'text-accent-rose', bg: 'bg-accent-rose/15', glow: 'shadow-[0_0_12px_rgba(255,107,138,0.3)]' },
};

export function TransactionTable({ transactions, onTransactionClick, newTransactionId }: TransactionTableProps) {
  return (
    <div className="h-full flex flex-col glass-card rounded-2xl overflow-hidden relative">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg italic text-morpho-pearl">Recent Activity</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-accent-emerald font-mono">Live</span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-morpho-silver text-xs tracking-wider uppercase font-mono">
            Awaiting transactions...
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {transactions.map((tx, index) => {
              const config = ACTION_CONFIG[tx.action];
              const isNew = tx.id === newTransactionId;

              return (
                <div
                  key={tx.id}
                  onClick={() => onTransactionClick(tx)}
                  className={`
                    px-5 py-3.5 cursor-pointer transition-all duration-300 group
                    hover:bg-white/[0.02]
                    ${isNew ? 'animate-slide-in-row' : ''}
                  `}
                  style={{
                    animationDelay: isNew ? '0ms' : `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Action Icon */}
                    <div
                      className={`
                        w-9 h-9 rounded-xl flex items-center justify-center
                        ${config.bg} ${config.color} font-semibold text-sm flex-shrink-0
                        transition-shadow duration-300
                        ${isNew ? config.glow : 'group-hover:' + config.glow}
                      `}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                          {tx.action}
                        </span>
                        <NetworkBadge network={tx.network} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-morpho-pearl font-mono">
                          {formatAmount(tx.amount, tx.asset)}
                        </span>
                        <span className="text-xs text-morpho-silver font-mono">
                          {tx.asset}
                        </span>
                        <span className="text-[10px] text-morpho-silver/60 font-mono">
                          {truncateAddress(tx.walletAddress)}
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-[10px] text-morpho-silver/70 flex-shrink-0 font-mono tracking-wide">
                      {formatRelativeTime(tx.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 bg-morpho-charcoal/50">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-morpho-silver/50 tracking-[0.1em] uppercase font-mono">
            {transactions.length} transactions
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-accent-cyan/50" />
            <div className="w-1 h-1 rounded-full bg-accent-violet/50" />
            <div className="w-1 h-1 rounded-full bg-accent-amber/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
