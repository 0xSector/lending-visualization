import type { Transaction, ActionType } from '../types/transaction';
import { formatAmount, formatRelativeTime, truncateAddress } from '../utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  newTransactionId?: string;
}

const ACTION_LABELS: Record<ActionType, string> = {
  supply: 'Supply',
  borrow: 'Borrow',
  repay: 'Repay',
  withdraw: 'Withdraw',
  liquidation: 'Liquidation',
};

// Asset brand colors
const ASSET_COLORS: Record<string, string> = {
  USDC: '#2775CA', // USDC blue
  USDT: '#26A17B', // Tether green
  ETH: '#627EEA',  // Ethereum purple
  WETH: '#627EEA', // Wrapped ETH
  WBTC: '#F7931A', // Bitcoin orange
  DAI: '#F5AC37',  // DAI yellow
  cbETH: '#0052FF', // Coinbase blue
  stETH: '#00A3FF', // Lido blue
  PYUSD: '#0047BB', // PayPal blue
};

// Asset logo paths
const ASSET_LOGOS: Record<string, string> = {
  USDC: '/tokens/usdc.png',
  USDT: '/tokens/usdt.png',
};

function getAssetColor(asset: string): string {
  return ASSET_COLORS[asset] || '#87CEEB';
}

function getAssetLogo(asset: string): string | null {
  return ASSET_LOGOS[asset] || null;
}

// Calculate a percentage for the progress bar (mock)
function getUtilization(tx: Transaction): number {
  const seed = parseInt(tx.id.slice(-4), 16);
  return 20 + (seed % 60);
}

export function TransactionTable({ transactions, onTransactionClick, newTransactionId }: TransactionTableProps) {
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#1A1F71]">Recent Activity</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00A1E0]/10 border border-[#00A1E0]/20">
              <span className="w-1.5 h-1.5 bg-[#00A1E0] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#00A1E0]">Live</span>
            </span>
          </div>
          <span className="text-sm text-gray-400">{transactions.length} transactions</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Wallet</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-2">Asset</div>
          <div className="col-span-3">Amount</div>
          <div className="col-span-2 text-right">Time</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Awaiting transactions...
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx, index) => {
              const isNew = tx.id === newTransactionId;
              const utilization = getUtilization(tx);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={tx.id}
                  onClick={() => onTransactionClick(tx)}
                  className={`
                    px-6 py-4 cursor-pointer transition-all duration-200
                    hover:bg-[#00A1E0]/10
                    ${isNew ? 'animate-slide-in-row bg-[#00A1E0]/5' : isEven ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Wallet */}
                    <div className="col-span-3 flex items-center gap-3">
                      {getAssetLogo(tx.asset) ? (
                        <img
                          src={getAssetLogo(tx.asset)!}
                          alt={tx.asset}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                          style={{ backgroundColor: getAssetColor(tx.asset) }}
                        >
                          {tx.asset}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1A1F71] truncate">
                          {truncateAddress(tx.walletAddress)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.network}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">
                        {ACTION_LABELS[tx.action]}
                      </span>
                    </div>

                    {/* Asset */}
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-[#1A1F71]">
                        {tx.asset}
                      </span>
                      {tx.collateralAsset && (
                        <span className="text-xs text-gray-400 ml-1">
                          / {tx.collateralAsset}
                        </span>
                      )}
                    </div>

                    {/* Amount with progress bar */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00A1E0] rounded-full transition-all duration-500"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                          {formatAmount(tx.amount, tx.asset)}
                        </span>
                      </div>
                      {tx.apy && (
                        <p className="text-xs text-gray-400 mt-0.5 text-right">
                          {tx.apy.toFixed(2)}% APY
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-gray-400">
                        {formatRelativeTime(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Onchain Lending Activity
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#1A1F71]" />
            <div className="w-2 h-2 rounded-full bg-[#00A1E0]" />
            <div className="w-2 h-2 rounded-full bg-[#F7B600]" />
          </div>
        </div>
      </div>
    </div>
  );
}
