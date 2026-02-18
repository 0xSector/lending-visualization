import type { ActionType, TransactionCardProps } from '../types/transaction';
import { NetworkBadge } from './NetworkBadge';
import { getShortSummary } from '../utils/humanize';
import { formatRelativeTime } from '../utils/formatters';

const ACTION_ICONS: Record<ActionType, { icon: string; bgColor: string; textColor: string }> = {
  supply: {
    icon: '+',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  borrow: {
    icon: '-',
    bgColor: 'bg-visa-blue/10',
    textColor: 'text-visa-blue',
  },
  repay: {
    icon: '↩',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  withdraw: {
    icon: '↑',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },
  liquidation: {
    icon: '!',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
  },
};

const ACTION_LABELS: Record<ActionType, string> = {
  supply: 'Supply',
  borrow: 'Borrow',
  repay: 'Repay',
  withdraw: 'Withdraw',
  liquidation: 'Liquidation',
};

export function TransactionCard({ transaction, onClick, isNew }: TransactionCardProps) {
  const iconConfig = ACTION_ICONS[transaction.action];
  const summary = getShortSummary(transaction);
  const timeAgo = formatRelativeTime(transaction.timestamp);

  return (
    <div
      onClick={() => onClick(transaction)}
      className={`
        bg-white border border-gray-100 rounded-lg p-4 shadow-sm
        hover:shadow-md hover:border-visa-blue/30 cursor-pointer
        transition-all duration-200
        ${isNew ? 'animate-slide-in' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Action Icon */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${iconConfig.bgColor} ${iconConfig.textColor}
            font-bold text-lg flex-shrink-0
          `}
        >
          {iconConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Action Label & Network */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-visa-navy">
              {ACTION_LABELS[transaction.action]}
            </span>
            <NetworkBadge network={transaction.network} />
          </div>

          {/* Summary */}
          <p className="text-gray-700 text-sm truncate">
            {summary}
          </p>

          {/* Timestamp */}
          <p className="text-gray-400 text-xs mt-1">
            {timeAgo}
          </p>
        </div>

        {/* Click indicator */}
        <div className="text-gray-300 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
